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

/* The second half of a block the paginator had to cut, because the whole
 * of it stood taller than a sheet. Two things follow from a block being a
 * continuation rather than a new entry:
 *
 *   Its opening paragraph is not a flavour line. The entry blocks set
 *   their first paragraph as the voice, in italic accent. On a
 *   continuation that paragraph is simply the next thing being said, and
 *   italicising it would invent an emphasis the author never wrote.
 *
 *   It is marked, so a reader meeting the card partway down a page knows
 *   they are looking at a page turn and not at a second entry wearing the
 *   same name.
 *
 * Handled once, in applyBlocks, rather than in each of the seven
 * renderers: the mark is stripped off the title before a renderer ever
 * sees it, and the class is added to what comes back. Two of them parse a
 * parenthetical out of the title - a Boon's cost, a Skill's Element - and
 * would otherwise read "(continued)" as one and print it in the pill.
 */
const CONTINUED = /\s*\(continued\)\s*$/;

/* The opening paragraph, where a block has one to spare and is not a
   continuation. Shared by every entry block, so the rule is written once. */
const flavourOf = (paras, cont) => (paras.length > 1 && !cont ? paras.shift() : '');

/* Renders <div class="base"> with an optional title span. */
const div = (base) => (title, body, variant) => {
  const head = title.trim() ? `<span class="block-title">${esc(title.trim())}</span>\n\n` : '';
  return `<div class="${cls(base, variant)}">\n\n${head}${body.trim()}\n\n</div>`;
};

export const BLOCKS = {
  wide: {
    help: 'spans both columns',
    /* Worth a title even with no frame to hang it on. A wide table is
     * usually the tail of an entry that ended on the page before - a
     * build menu, a price list - and untitled it meets the reader as a
     * bare header row with nothing saying whose it is. Titling it also
     * picks up the (continued) mark, so a menu split across sheets says
     * so instead of looking like a second, different table. */
    takesTitle: true,
    render: div('wide'),
  },
  aside: {
    help: 'a sidebar, apart from the text',
    takesTitle: true,
    render: div('aside'),
  },
  box: {
    help: 'a callout for a rule or example',
    takesTitle: true,
    render: div('box'),
  },
  roll: {
    help: 'a centred roll or formula',
    takesTitle: false,
    render: (_title, body, variant) =>
      `<div class="${cls('roll-box', variant)}">\n\n${body.trim()}\n\n</div>`,
  },
  note: {
    help: 'a framed note, no title',
    /* The roll box holds a formula, so it is set in the heading face,
     * letter spaced and centred, the way a plaque is. A sentence set
     * that way arrives as a sign rather than as something to read.
     * Same frame, body face, ranged left - for a rule stated in
     * words. */
    takesTitle: false,
    render: (_title, body, variant) =>
      `<div class="${cls('note-box', variant)}">\n\n${body.trim()}\n\n</div>`,
  },
  gift: {
    help: 'five levels, Adders and Limiters',
    takesTitle: true,
    /* The largest entries in the book: five levels each, plus Adders and
     * Limiters. Levels get the numbered ladder the other entries use;
     * Adders and Limiters are labelled runs rather than numbered, so they
     * are picked out by their heading instead. */
    render: (title, body, variant, cont) => {
      const paras = body.trim().split(/\n\s*\n/);
      const flavour = flavourOf(paras, cont);
      const head = `<span class="gift-name">${esc(title.trim())}</span>`;
      const fl = flavour
        ? `<div class="gift-flavour">\n\n${flavour}\n\n</div>\n\n`
        : '';
      let section = '';
      const rest = paras.map((p) => {
        const t = p.trim();
        const label = t.match(/^\*\*(Adders?|Limiters?)\*\*:?\s*$/i);
        if (label) {
          section = label[1].toLowerCase().replace(/s$/, '');
          return `<span class="gift-section">${esc(label[1])}</span>`;
        }
        const lvl = t.match(/^\*\*(\d+)\*\*\s*(.*)$/s);
        if (lvl) {
          section = '';
          return `<div class="gift-level gift-level--${esc(lvl[1])}">\n\n<span class="gift-n">${esc(lvl[1])}</span>${lvl[2]}\n\n</div>`;
        }
        return section
          ? `<div class="gift-opt gift-opt--${section}">\n\n${t}\n\n</div>`
          : p;
      }).join('\n\n');
      return `<div class="${cls('gift', variant)}">\n\n${head}\n\n${fl}${rest}\n\n</div>`;
    },
  },
  flaw: {
    help: 'summary, then five levels',
    takesTitle: true,
    /* Structurally a Resource - every Flaw is rated 1-5 and the ladder is
     * the substance - but it reads as the opposite thing, so it carries
     * the danger tint rather than the accent. Worth the separate block
     * for that alone: a reader flicking through should never mistake a
     * Flaw for something they are buying. */
    render: (title, body, variant, cont) => {
      const paras = body.trim().split(/\n\s*\n/);
      const flavour = flavourOf(paras, cont);
      const head = `<span class="flaw-name">${esc(title.trim())}</span>`;
      const fl = flavour
        ? `<div class="flaw-flavour">\n\n${flavour}\n\n</div>\n\n`
        : '';
      const rest = paras.map((p) => {
        const m = p.trim().match(/^\*\*(\d+)\*\*\s*(.*)$/s);
        return m
          ? `<div class="flaw-level flaw-level--${esc(m[1])}">\n\n<span class="flaw-n">${esc(m[1])}</span>${m[2]}\n\n</div>`
          : p;
      }).join('\n\n');
      return `<div class="${cls('flaw', variant)}">\n\n${head}\n\n${fl}${rest}\n\n</div>`;
    },
  },
  resource: {
    help: 'summary, then five levels',
    takesTitle: true,
    /* Every Resource is rated 1-5 and the ladder is the substance of the
     * entry, so a level line gets its rating in a badge and its text on
     * one row. A paragraph that does not open with **N** is left as
     * ordinary prose, which is what the summary line above them is. */
    render: (title, body, variant, cont) => {
      const paras = body.trim().split(/\n\s*\n/);
      const flavour = flavourOf(paras, cont);
      const head = `<span class="res-name">${esc(title.trim())}</span>`;
      const fl = flavour
        ? `<div class="res-flavour">\n\n${flavour}\n\n</div>\n\n`
        : '';
      const rest = paras.map((p) => {
        const m = p.trim().match(/^\*\*(\d+)\*\*\s*(.*)$/s);
        return m
          ? `<div class="res-level res-level--${esc(m[1])}">\n\n<span class="res-n">${esc(m[1])}</span>${m[2]}\n\n</div>`
          : p;
      }).join('\n\n');
      return `<div class="${cls('resource', variant)}">\n\n${head}\n\n${fl}${rest}\n\n</div>`;
    },
  },
  boon: {
    help: 'title it "Name (cost)"',
    takesTitle: true,
    /* Same shape as a skill entry, with one addition: most Boons are a
     * flat cost, but sixteen are bought as one of two, three or four
     * tiers. A line beginning "Tier N (...)" is lifted onto its own
     * strip so a reader can see at a glance which ones have that
     * structure without reading the paragraph first. */
    render: (title, body, variant, cont) => {
      const m = title.trim().match(/^(.*?)\s*\(([^)]+)\)\s*$/);
      const name = (m ? m[1] : title).trim();
      const cost = m ? m[2].trim() : '';
      const paras = body.trim().split(/\n\s*\n/);
      const flavour = flavourOf(paras, cont);
      const pill = cost ? `<span class="boon-cost">${esc(cost)}</span>` : '';
      const head = `<span class="boon-name">${esc(name)}</span>${pill}`;
      const fl = flavour
        ? `<div class="boon-flavour">\n\n${flavour}\n\n</div>\n\n`
        : '';
      const rest = paras.map((p) => (
        /^\*\*Tier\b/.test(p.trim())
          ? `<div class="boon-tier">\n\n${p.trim()}\n\n</div>`
          : p
      )).join('\n\n');
      return `<div class="${cls('boon', variant)}">\n\n${head}\n\n${fl}${rest}\n\n</div>`;
    },
  },
  skill: {
    help: 'title it "Name (Element)"',
    takesTitle: true,
    /* The element is read out of the title rather than typed a second
     * time as a variant, so the colour can never disagree with the text
     * beside it. The first paragraph of the body is the flavour line;
     * everything after it is the technical description. A block with a
     * single paragraph is all description and no flavour, which is fine. */
    render: (title, body, variant, cont) => {
      const m = title.trim().match(/^(.*?)\s*\(([^)]+)\)\s*$/);
      const name = (m ? m[1] : title).trim();
      const elem = m ? m[2].trim() : '';
      const key = elem.toLowerCase();
      const paras = body.trim().split(/\n\s*\n/);
      const flavour = flavourOf(paras, cont);
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
    help: 'a stat block',
    takesTitle: true,
    /* The stat line is the anchor of a stat block, so it is picked out
     * and given its own strip. It is recognised by the middot the
     * Adversary Index already uses to separate the figures, which means
     * an existing block pastes in with nothing to rewrite. */
    render: (title, body, variant, cont) => {
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
    help: 'an image; the title captions it',
    takesTitle: true,
    render: (title, body, variant, cont) => {
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

/* Variants that name a layout rather than a colour. Kept apart from
 * VARIANTS because sample.js renders one swatch per colour, and a
 * table is not a colour. Both lists are allowlists for the same
 * reason: a misspelled variant should vanish, not emit a dead class. */
export const LAYOUT_VARIANTS = ['difficulty'];

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
      const lower = variant ? variant.toLowerCase() : '';
      const v = lower && (VARIANTS.includes(lower) || LAYOUT_VARIANTS.includes(lower))
        ? lower : '';
      changed = true;
      const cont = CONTINUED.test(title || '');
      const shown = cont ? title.replace(CONTINUED, '') : title;
      const html = block.render(block.takesTitle ? shown : '', body, v, cont);
      // The mark goes on as a class rather than staying in the title, so
      // the wording lives in one CSS rule instead of in seven renderers -
      // and so the two blocks that read a parenthetical out of their title
      // never mistake it for a cost or an Element.
      return cont ? html.replace('class="', 'class="is-continued ') : html;
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
