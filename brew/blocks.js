/* Block syntax.
 *
 * There is exactly one shape for every block:
 *
 *     ::: name Optional title
 *     ...markdown...
 *     :::
 *
 * Nothing else to learn, and adding a block type never changes the
 * syntax - only the word after the colons. This is Pandoc's fenced-div
 * convention, so it is a real standard rather than a private one.
 *
 * The body is parsed as markdown afterwards, so tables, lists,
 * emphasis and images all work inside any block.
 *
 * To add a block:
 *   1. add an entry to BLOCKS below
 *   2. add a `.page .your-class` rule to brew.css
 *   3. it appears in the Syntax sample automatically
 */

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* A variant adds a second class, so the base styling stays in one place
   and the colour is a thin override on top of it. */
const cls = (base, variant) => (variant ? `${base} ${base}--${variant}` : base);

/* Renders <div class="base"> with an optional title span. */
const div = (base) => (title, body, variant) => {
  const head = title.trim() ? `<span class="block-title">${esc(title.trim())}</span>\n\n` : '';
  return `<div class="${cls(base, variant)}">\n\n${head}${body.trim()}\n\n</div>`;
};

export const BLOCKS = {
  wide: {
    help: 'spans both columns - use for big tables, art, anything that needs the full page',
    takesTitle: false,
    render: (_title, body) => `<div class="wide">\n\n${body.trim()}\n\n</div>`,
  },
  aside: {
    help: 'a sidebar, set apart from the main text',
    takesTitle: true,
    render: div('aside'),
  },
  box: {
    help: 'a callout box for a rule, an example, or anything worth boxing',
    takesTitle: true,
    render: div('box'),
  },
  roll: {
    help: 'a centred roll or formula, for things the reader will look up mid-game',
    takesTitle: false,
    render: (_title, body, variant) =>
      `<div class="${cls('roll-box', variant)}">\n\n${body.trim()}\n\n</div>`,
  },
  skill: {
    help: 'a skill entry - title it "Name (Element)", flavour line first, rules after',
    takesTitle: true,
    /* The element is read out of the title rather than typed a second
     * time as a variant, so the colour can never disagree with the text
     * beside it. The first paragraph of the body is the flavour line;
     * everything after it is the technical description. A block with a
     * single paragraph is all description and no flavour, which is fine. */
    render: (title, body, variant) => {
      const m = title.trim().match(/^(.*?)\s*\(([^)]+)\)\s*$/);
      const name = (m ? m[1] : title).trim();
      const elem = m ? m[2].trim() : '';
      const key = elem.toLowerCase();
      const paras = body.trim().split(/\n\s*\n/);
      const flavour = paras.length > 1 ? paras.shift() : '';
      const rest = paras.join('\n\n');
      const pill = elem ? `<span class="skill-elem">${esc(elem)}</span>` : '';
      const head = `<span class="skill-name">${esc(name)}</span>${pill}`;
      const fl = flavour
        ? `<div class="skill-flavour">\n\n${flavour}\n\n</div>\n\n`
        : '';
      const cl = cls('skill', VARIANTS.includes(key) ? key : (variant || ''));
      return `<div class="${cl}">\n\n${head}\n\n${fl}${rest}\n\n</div>`;
    },
  },
  stat: {
    help: 'a creature or NPC stat block - paste one straight out of the Adversary Index',
    takesTitle: true,
    /* The stat line is the anchor of a stat block, so it is picked out
     * and given its own strip. It is recognised by the middot the
     * Adversary Index already uses to separate the figures, which means
     * an existing block pastes in with nothing to rewrite. */
    render: (title, body, variant) => {
      const head = title.trim()
        ? `<span class="block-title">${esc(title.trim())}</span>\n\n`
        : '';
      const lines = body.trim().split('\n').map((line) =>
        line.includes(' · ')
          ? `<div class="stat-line">\n\n${line.trim()}\n\n</div>`
          : line,
      );
      return `<div class="${cls('stat', variant)}">\n\n${head}${lines.join('\n')}\n\n</div>`;
    },
  },
  figure: {
    help: 'an image with a caption - the title is the caption',
    takesTitle: true,
    render: (title, body, variant) => {
      const cap = title.trim() ? `\n\n<span class="caption">${esc(title.trim())}</span>` : '';
      return `<figure class="${cls('figure', variant)}">\n\n${body.trim()}${cap}\n\n</figure>`;
    },
  },
};

/* Fenced code is lifted out before substitution and restored after, so
 * a document can show its own syntax without the tool rewriting the
 * example, and so a stray ::: in a code sample cannot close a real
 * block further down. */
const FENCE = /^([ \t]*)(```+|~~~+)[^\n]*\n[\s\S]*?^\1?\2[ \t]*$/gm;

/* ::: name[.variant] [title] ... ::: - non-greedy, so sibling blocks
 * do not merge. */
const BLOCK = /^:::[ \t]*([a-zA-Z][\w-]*)(?:\.([a-zA-Z][\w-]*))?[ \t]*(.*)$([\s\S]*?)^:::[ \t]*$/gm;

/* Colour variants, from docs/style-guide.html. The semantic roles come
 * from the Battle Tracker set; the Element colours are listed there as
 * proposed, and this is their first use. A name not on this list is
 * ignored rather than emitted, so a typo cannot leave a dead class. */
export const VARIANTS = [
  'pc', 'ally', 'npc', 'danger', 'text', 'accent',
  'earth', 'air', 'fire', 'water', 'moira',
];

/* Private-use characters as the placeholder delimiters. A block's body
 * is trimmed before it is re-emitted, so a space-delimited placeholder
 * loses its delimiters and leaks as literal text; these survive trim
 * and cannot occur in real prose. */
const HOLD_A = '\uE000';
const HOLD_B = '\uE001';

export function applyBlocks(md) {
  const held = [];
  md = md.replace(FENCE, (m) => `${HOLD_A}${held.push(m) - 1}${HOLD_B}`);

  // Repeat so blocks nested one inside another are both handled.
  for (let pass = 0; pass < 3; pass++) {
    let changed = false;
    md = md.replace(BLOCK, (whole, name, variant, title, body) => {
      const block = BLOCKS[name.toLowerCase()];
      if (!block) return whole;          // unknown name: leave it visible
      const v = variant && VARIANTS.includes(variant.toLowerCase())
        ? variant.toLowerCase() : '';
      changed = true;
      return block.render(block.takesTitle ? title : '', body, v);
    });
    if (!changed) break;
  }

  return md.replace(new RegExp(HOLD_A + '(\\d+)' + HOLD_B, 'g'), (_m, i) => held[Number(i)]);
}

export function blockHelp() {
  return Object.entries(BLOCKS).map(([name, b]) => ({
    name,
    help: b.help,
    takesTitle: b.takesTitle,
  }));
}
