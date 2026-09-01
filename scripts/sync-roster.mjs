// Builds the 20_Below_Roster repo (the Owlbear Rodeo extension) from
// tracker/ in this repo.
//
// The tracker is one page with three deployments: the Owlbear extension,
// the standalone web tracker at /tracker/, and the desktop shell. This repo
// is the source; the extension repo exists only to keep serving a stable
// manifest URL that is already installed in people's rooms.
//
// The one adaptation: in this repo the page imports the engine from app/,
// which doesn't exist alongside the extension - so the copy imports it from
// its own lib/ instead, and lib/ is copied in beside it. It ships with the
// extension rather than being fetched from the site, because a whole engine
// has no sensible offline fallback.
//
//   node scripts/sync-roster.mjs [path-to-20_Below_Roster]

import { copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..');
const dest = resolve(process.argv[2] || join(repo, '..', '20 Below Roster'));

if (!existsSync(dest)) {
  console.error(`Roster repo not found: ${dest}`);
  process.exit(1);
}

// Preserve the relative layout so model.js's own imports resolve.
const LIB = [
  ['app/state.js', 'lib/state.js'],
  ['app/roller/core.js', 'lib/roller/core.js'],
  ['app/combat/model.js', 'lib/combat/model.js'],
];

for (const [from, to] of LIB) {
  const out = join(dest, to);
  mkdirSync(dirname(out), { recursive: true });
  copyFileSync(join(repo, from), out);
  console.log(`  ${from}  ->  ${to}`);
}

// ---- the page itself ----
const SOURCE_IMPORT = '"../app/combat/model.js"';
const EXTENSION_IMPORT = '"./lib/combat/model.js"';

let page = readFileSync(join(repo, 'tracker/index.html'), 'utf8');
if (!page.includes(SOURCE_IMPORT)) {
  console.error(
    `tracker/index.html no longer imports ${SOURCE_IMPORT} - the sync's path `
    + 'rewrite is out of date. Fix it here rather than editing the extension.',
  );
  process.exit(1);
}
page = page.replace(SOURCE_IMPORT, EXTENSION_IMPORT);

const BANNER = [
  '<!--',
  '  GENERATED FILE - do not edit here.',
  '',
  '  Built from tracker/index.html in https://github.com/feralucce/20_Below',
  '  by scripts/sync-roster.mjs. Edit it there and re-run the sync; anything',
  '  changed in this repo is overwritten.',
  '-->',
  '',
].join('\n');
page = page.replace('<!doctype html>', BANNER + '<!doctype html>');

writeFileSync(join(dest, 'index.html'), page, 'utf8');
console.log('  tracker/index.html  ->  index.html  (import rewritten)');

writeFileSync(
  join(dest, 'lib', 'README.md'),
  [
    '# lib/ - generated, do not edit',
    '',
    'Copied from the main [20_Below](https://github.com/feralucce/20_Below) repo by',
    '`scripts/sync-roster.mjs`, along with `index.html` itself. Edit the originals there',
    'and re-run the sync; anything changed here is overwritten.',
    '',
    '| File | Source |',
    '| --- | --- |',
    ...LIB.map(([from, to]) => `| \`${to.replace('lib/', '')}\` | \`${from}\` |`),
    '| `../index.html` | `tracker/index.html` |',
    '',
  ].join('\n'),
  'utf8',
);

console.log(`\nSynced to ${dest}`);
