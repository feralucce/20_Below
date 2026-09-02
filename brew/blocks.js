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

/* Renders <div class="cls"> with an optional title span. */
const div = (cls, titleClass = 'block-title') => (title, body) => {
  const head = title.trim() ? `<span class="${titleClass}">${esc(title.trim())}</span>\n\n` : '';
  return `<div class="${cls}">\n\n${head}${body.trim()}\n\n</div>`;
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
    render: (_title, body) => `<div class="roll-box">\n\n${body.trim()}\n\n</div>`,
  },
  figure: {
    help: 'an image with a caption - the title is the caption',
    takesTitle: true,
    render: (title, body) => {
      const cap = title.trim() ? `\n\n<span class="caption">${esc(title.trim())}</span>` : '';
      return `<figure class="figure">\n\n${body.trim()}${cap}\n\n</figure>`;
    },
  },
};

/* Fenced code is lifted out before substitution and restored after, so
 * a document can show its own syntax without the tool rewriting the
 * example, and so a stray ::: in a code sample cannot close a real
 * block further down. */
const FENCE = /^([ \t]*)(```+|~~~+)[^\n]*\n[\s\S]*?^\1?\2[ \t]*$/gm;

/* ::: name [title] ... ::: - non-greedy, so sibling blocks do not merge. */
const BLOCK = /^:::[ \t]*([a-zA-Z][\w-]*)[ \t]*(.*)$([\s\S]*?)^:::[ \t]*$/gm;

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
    md = md.replace(BLOCK, (whole, name, title, body) => {
      const block = BLOCKS[name.toLowerCase()];
      if (!block) return whole;          // unknown name: leave it visible
      changed = true;
      return block.render(block.takesTitle ? title : '', body);
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
