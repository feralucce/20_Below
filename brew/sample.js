const V = new URL(import.meta.url).search;
const { blockHelp, VARIANTS } = await import('./blocks.js' + V);

/* Two documents.
 *
 *   guide()   - the visual reference. Everything the tool can do,
 *               shown as source and then as the result it produces.
 *               Opened in its own window by the Reference button, and
 *               loaded on a first visit.
 *   starter() - what the New button gives you. Deliberately almost
 *               empty; the reference is a click away.
 *
 * The block and colour lists are generated from blocks.js, so adding
 * either one documents itself with no second place to update.
 */

const B = String.fromCharCode(92);            // a single backslash
const F = String.fromCharCode(96).repeat(3);  // a code fence
const T = String.fromCharCode(96);            // one backtick, inline code

/* Source, then the same source rendered. The point of the guide is
 * that you never have to imagine the result. */
function demo(...lines) {
  return [F, ...lines, F, '', ...lines].join('\n');
}

/* Each block rendered with its own invocation printed inside it. The
 * invocation is inline code so its line does not start with colons - a
 * bare ::: would close the very block it is sitting in. */
function blockDemos() {
  return blockHelp()
    .map((b) => {
      const open = '::: ' + b.name + (b.takesTitle ? ' A title' : '');
      return [open, T + open + T, '', b.help + '.', ':::'].join('\n');
    })
    .join('\n\n');
}

/* One roll box per colour, labelled with its own name. */
function colourDemos() {
  return VARIANTS.filter((v) => v !== 'npc')
    .map((v) => ['::: roll.' + v, v.charAt(0).toUpperCase() + v.slice(1), ':::'].join('\n'))
    .join('\n\n');
}

export function starter() {
  return [
    '# Title',
    '',
    'Start writing. Two columns by default; the Reference button opens',
    'a guide to everything the tool can do.',
    '',
  ].join('\n');
}

export function guide() {
  return [
    '# The Brewer',
    '',
    'Everything this tool can do, shown as the markdown that produces it',
    'and then as the result. Pages are two columns by default.',
    '',
    '## Two markers',
    '',
    'The whole syntax is two things.',
    '',
    F,
    B + 'page',
    B + 'page cols=1',
    B + 'page bg=parchment',
    '',
    '::: name A title',
    ':::',
    F,
    '',
    'The first starts a new page - as one column, or with a background,',
    'if you say so. The second opens a block; the bare colons close it.',
    '',
    B + 'page cols=1',
    '',
    '# Headings',
    '',
    'Six levels. This page is set to one column, because a level-one',
    'heading spans the full measure by design and would otherwise break',
    'the demonstration in half.',
    '',
    demo('# Heading one'),
    '',
    demo('## Heading two'),
    '',
    demo('### Heading three'),
    '',
    demo('#### Heading four'),
    '',
    demo('##### Heading five'),
    '',
    demo('###### Heading six'),
    '',
    B + 'page',
    '',
    '# Ordinary markdown',
    '',
    '## Emphasis',
    '',
    demo('**bold**, *italic*, ***both***, and `inline code`.'),
    '',
    '## Lists',
    '',
    demo('- a bulleted item', '- another item', '  - and one indented'),
    '',
    demo('1. a numbered item', '2. the next one', '3. and a third'),
    '',
    '## Links',
    '',
    demo('[a link](https://20belowrpg.com)'),
    '',
    '## Blockquotes',
    '',
    demo('> A quotation, or a line of read-aloud text.'),
    '',
    '## Rules',
    '',
    demo('---'),
    '',
    '## Tables',
    '',
    demo(
      '| Element | Splits into |',
      '|---|---|',
      '| Earth | Soak / Potence |',
      '| Moira | Atropos / Klotho |',
    ),
    '',
    '## Images',
    '',
    'Images are referenced by URL, so they travel with the document.',
    '',
    F,
    '![alt text](https://your-host/art.png)',
    F,
    '',
    B + 'page',
    '',
    '# The blocks',
    '',
    'Each block below was produced by the command printed inside it.',
    '',
    blockDemos(),
    '',
    '## Wide',
    '',
    'A wide block spans both columns. Spanning splits the flow, so text',
    'after one starts again below it.',
    '',
    '::: wide',
    '### Wide content',
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
    '## Stat blocks',
    '',
    'A stat block pastes in from the Adversary Index unchanged. The line',
    'of figures is picked out automatically - it is recognised by the',
    'middot separators the index already uses.',
    '',
    '::: stat.danger Rougarou',
    'A cursed shape that runs the batture at night, and is somebody local',
    'in the morning.',
    '',
    '**Soak** 3 · **Attack** 7 · **Defense** 6 · **Health Levels** 7 · **Movement Rate** 12m',
    '',
    '**Claws/Bite**: 7, Melee',
    '',
    '**Notable Skills**: Athletics 9, Stealth 8, Perception 8',
    '',
    '**Traits**: **Regenerates** - heals 1 Health Level at the start of',
    'each of its turns, unless its most recent wound came from a weapon',
    'the GM has ruled counts as silver.',
    ':::',
    '',
    B + 'page',
    '',
    '# Colour',
    '',
    'Any block takes a colour from the style guide, written after a dot.',
    '',
    F,
    '::: box.danger A title',
    '::: roll.fire',
    '::: aside.moira A title',
    F,
    '',
    '::: box.danger A danger box',
    'Danger and npc share the red from the Battle Tracker.',
    ':::',
    '',
    '::: aside.water A water aside',
    'Colour tints the rule and the title, not the fill, so body text',
    'keeps its contrast.',
    ':::',
    '',
    '## Every colour',
    '',
    colourDemos(),
    '',
    '::: aside In greyscale',
    'Every colour collapses to one grey. A black and white print cannot',
    'carry nine hues, so say in words what the colour would have said.',
    ':::',
    '',
    B + 'page cols=1',
    '',
    '# Publishing what you make',
    '',
    '20 Below is released under the ORC License. You may publish material',
    'for it - free or commercial - without asking permission. What the',
    'licence asks in return is that your product carries these notices.',
    '',
    '::: box Required in your product',
    '**ORC Notice.** This product is licensed under the ORC License located',
    'at the Library of Congress at TX 9-307-067 and available online at',
    'various locations including azoralaw.com/orclicense and others. All',
    'warranties are disclaimed as set forth therein.',
    '',
    '**Attribution.** This product is based on the following Licensed',
    'Material: 20 Below Core Rules, Copyright (c) 2026 Feralucce Savage.',
    '',
    '**Reserved Material.** List anything in your own product you are',
    'reserving - your setting, characters, art and branding.',
    ':::',
    '',
    '::: aside.danger What is not licensed',
    'The ORC licenses game mechanics, not branding. The name **20 Below**,',
    'its logos and its trade dress are Reserved Material, and no trademark',
    'rights pass under the ORC at all. Using them, or implying that your',
    'product is endorsed or official, needs separate permission.',
    ':::',
    '',
    '::: aside.pc Powered by 20 Below',
    'There is a brand mark for products made for this system. It is opt-in',
    'and granted separately from the ORC - ask, agree to the brand terms,',
    'and you may carry it. Publishing under the ORC alone does not include',
    'it, and does not require it.',
    ':::',
    '',
    'The full licence, and what is open versus reserved, is on the Licence',
    'page linked in the toolbar.',
    '',
    B + 'page cols=1',
    '',
    '# A single-column page',
    '',
    'Set with ' + T + B + 'page cols=1' + T + ' when a page wants the full measure - a',
    'title page, a full-page illustration, or a long table that reads',
    'better wide.',
    '',
  ].join('\n');
}
