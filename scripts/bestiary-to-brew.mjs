/* Turn the bestiary rules files into a Brewer-ready document.
 *
 *   node scripts/bestiary-to-brew.mjs
 *
 * Reads rules/adversary-index.md, rules/cryptids.md and
 * rules/nightmare-creatures.md, and writes brew/examples/bestiary.md -
 * every creature wrapped in a ::: stat block, ready to open in the
 * Brewer and print.
 *
 * Re-run it whenever the bestiary changes. Nothing here edits the
 * source files; the output is disposable and regenerated wholesale.
 *
 * Each creature in the source sits inside an adversary-card table,
 * which is what makes the extraction reliable - the heading level and
 * the prose around it vary, the wrapper does not.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const SOURCES = [
  { file: 'rules/adversary-index.md', title: 'Adversaries' },
  { file: 'rules/cryptids.md', title: 'Cryptids' },
  { file: 'rules/nightmare-creatures.md', title: 'Nightmare Creatures' },
];

const CARD = /<table class="adversary-card">\s*<tr>\s*<td markdown="1">([\s\S]*?)<\/td>\s*<\/tr>\s*<\/table>/g;

/* Characters of stat block that fit one Letter page in two columns,
 * measured against the real bestiary. See the note where it is used. */
const PAGE_BUDGET = 2200;
const HEADING_COST = 400;

let pages = [];
let total = 0;
const skipped = [];

for (const { file, title } of SOURCES) {
  const src = readFileSync(resolve(root, file), 'utf8');
  const blocks = [];

  for (const m of src.matchAll(CARD)) {
    const inner = m[1].trim();
    const head = inner.match(/^#{2,4}\s+(.+)$/m);
    if (!head) {
      skipped.push(`${file}: a card with no heading`);
      continue;
    }
    const name = head[1].trim();
    const body = inner.slice(head.index + head[0].length).trim();

    // A stat block is only worth the wrapper if it has the stat line.
    if (!body.includes(' · ')) {
      skipped.push(`${file}: ${name} - no stat line`);
      continue;
    }
    // A line of bare colons inside the body would close the block early.
    if (/^:::\s*$/m.test(body)) {
      skipped.push(`${file}: ${name} - contains a ::: line`);
      continue;
    }

    blocks.push(`::: stat ${name}\n${body}\n:::`);
    total += 1;
  }

  /* Pagination is manual in the Brewer, so it is decided here. Pages
   * are packed by size rather than by a fixed count: entries run from a
   * three-line animal to a full agent with two Gifts, so a fixed count
   * either wastes half a page on the short ones or spills on the long
   * ones. A page that outgrows its sheet prints across several, with
   * the margins and background of one. */
  let page = [];
  let used = HEADING_COST;      // the section heading opens the first page
  let first = true;
  const flush = () => {
    if (!page.length) return;
    pages.push(first ? `# ${title}\n\n${page.join('\n\n')}` : page.join('\n\n'));
    first = false;
    page = [];
    used = 0;
  };
  for (const b of blocks) {
    if (page.length && used + b.length > PAGE_BUDGET) flush();
    page.push(b);
    used += b.length;
  }
  flush();
}

const doc = [
  '# Bestiary',
  '',
  'Generated from the 20 Below rules files by `scripts/bestiary-to-brew.mjs`.',
  `${total} creatures. Re-run the script after the bestiary changes.`,
  '',
  ...pages.flatMap((p) => ['\\page', '', p, '']),
].join('\n');

const out = resolve(root, 'brew/examples/bestiary.md');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, doc, 'utf8');

console.log(`wrote brew/examples/bestiary.md - ${total} creatures, ${pages.length} sections`);
if (skipped.length) {
  console.log(`skipped ${skipped.length}:`);
  for (const s of skipped) console.log('  ' + s);
}
