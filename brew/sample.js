const V = new URL(import.meta.url).search;
const { blockHelp } = await import('./blocks.js' + V);

/* The document a new user sees, which doubles as the syntax reference.
 * The block list is generated from blocks.js, so adding a block type
 * makes it appear here automatically. */

const B = String.fromCharCode(92);   // a single backslash
const F = String.fromCharCode(96).repeat(3); // a code fence

function blockList() {
  return blockHelp()
    .map((b) => '::: ' + b.name + (b.takesTitle ? ' Optional title' : '') + '\n  ' + b.help)
    .join('\n\n');
}

export function sample() {
  return [
    '# Your Supplement',
    '',
    'Ordinary markdown works throughout: **bold**, *italic*, lists, links,',
    'tables and > blockquotes. Pages are two columns by default.',
    '',
    '## Two things to learn',
    '',
    'Everything in this tool is one of two markers. That is the whole syntax.',
    '',
    F,
    B + 'page',
    B + 'page cols=1',
    B + 'page bg=parchment',
    '',
    '::: name Optional title',
    ':::',
    F,
    '',
    'The first starts a new page - as one column, or with a background,',
    'if you say so. The second opens a block; the bare colons close it.',
    '',
    '## The blocks',
    '',
    F,
    blockList(),
    F,
    '',
    "::: aside Designer's note",
    'Blocks take markdown inside them, so **emphasis**, lists, tables and',
    'images all work in here too.',
    ':::',
    '',
    '::: box When to use a box',
    'A box holds a rule or an example. A sidebar holds an aside. Use whichever',
    'matches what the reader is meant to do with it.',
    ':::',
    '',
    '::: roll',
    'Roll 2d10 vs. your target number',
    ':::',
    '',
    '## Images',
    '',
    'Images are referenced by URL, so they travel with the document.',
    '',
    F,
    '![alt text](https://your-host/art.png)',
    '',
    '::: figure A caption for the image',
    '![](https://your-host/art.png)',
    ':::',
    F,
    '',
    '::: wide',
    '### Wide content',
    '',
    'Wrap anything in a wide block and it spans both columns - big tables,',
    'full-bleed art, a chart. Spanning splits the flow, so text after a wide',
    'block starts again below it.',
    '',
    '| Element | Splits into | Governs |',
    '|---|---|---|',
    '| Earth | Soak / Potence | Force, and what you can take |',
    '| Air | Initiative / Psyche | Speed and clarity |',
    '| Fire | Ferocity / Presence | Push, and how you land |',
    '| Water | Stamina / Health | Endurance and staying up |',
    '| Moira | Atropos / Klotho | Fate, Defense, Ki recovery |',
    ':::',
    '',
    'Text after the wide block picks up here, in columns again.',
    '',
    B + 'page cols=1',
    '',
    '# A single-column page',
    '',
    'Set a page to one column when it wants the full measure - a title page,',
    'a full-page illustration, or a long table that reads better wide.',
    '',
  ].join('\n');
}
