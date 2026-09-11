/* Insert the page breaks the document is missing.
 *
 * Pagination stays manual - the source still says where every page ends, and a
 * break you placed yourself is never moved. This only decides where the ones
 * you did not place should go, and writes them into the markdown you can see
 * rather than into hidden layout state.
 *
 * Three rules learned the hard way, each of which put blank sheets into a
 * printed PDF before it was understood:
 *
 *   Wait for webfonts. They load lazily and change how tall everything is.
 *   Measuring before they arrive lays text out in fallback metrics, so more
 *   appears to fit than really does.
 *
 *   Measure under the layout and trim the document will be printed at. POD is
 *   not digital with a border round it: bleed grows the sheet but is trimmed
 *   off, while the gutter and safe inset come out of the text block, leaving
 *   about 12% less room. Running inside the app, this measures in the live
 *   preview, so it is always looking at the real thing.
 *
 *   Check the finished document, not each page alone. A page measured on its
 *   own is a few pixels off the same page measured in place - POD alternates
 *   its gutter by page parity, and column rounding follows. So the packing
 *   pass is a first guess, and a verify pass against the assembled document
 *   moves anything still overhanging.
 */

const V = new URL(import.meta.url).search;
const { paginate, spills } = await import('./render.js' + V);

const PAGE_MARKER = /^\\page[ \t]*(.*)$/;
const HEADING = /^#{1,6} /;
const MAX_PASSES = 6;

/* The opening line of a ::: block, and the mark a split one carries.
 *
 * A block is never cut across a page by the packer's ordinary rules -
 * chunkPage refuses to split inside one, because half a block does not
 * render. That is right for every block small enough to fit and wrong
 * for the ones that are not: the biggest Gift entries run half again
 * over a two-column page, and a block that cannot be broken and cannot
 * fit gets clipped by the page's own overflow:hidden instead. Silently,
 * in print - the preview's warning banner is hidden there.
 *
 * So an oversize block is cut at a paragraph boundary and reopened on
 * the next sheet, the way a long entry continues in any printed book.
 * The mark is in the title because that is where a reader needs it. */
const BLOCK_OPEN = /^:::[ \t]*([a-zA-Z][\w-]*(?:\.[a-zA-Z][\w-]*)?)[ \t]*(.*)$/;
const BLOCK_CLOSE = /^:::[ \t]*$/;
const CONTINUED = ' (continued)';
const MAX_PIECES = 40;

function isContinuation(chunk) {
  const first = chunk.split('\n', 1)[0];
  return BLOCK_OPEN.test(first) && first.trim().endsWith(CONTINUED.trim());
}

/* Top-level chunks of one page's markdown, splitting on blank lines but never
   inside a ::: block or a fenced code sample - splitting there would cut a
   block in half and the halves would not render. */
export function chunkPage(markdown) {
  const lines = markdown.split('\n');
  const chunks = [];
  let cur = [];
  let fence = null;
  let blockDepth = 0;

  const flush = () => {
    if (cur.join('\n').trim()) chunks.push(cur.join('\n').trim());
    cur = [];
  };

  for (const line of lines) {
    const f = line.match(/^\s*(```+|~~~+)/);
    if (f) {
      if (!fence) fence = f[1][0];
      else if (f[1][0] === fence) fence = null;
    }
    if (!fence) {
      if (/^:::[ \t]*[a-zA-Z]/.test(line)) blockDepth += 1;
      else if (/^:::[ \t]*$/.test(line) && blockDepth > 0) blockDepth -= 1;
    }
    if (!line.trim() && !fence && blockDepth === 0) {
      flush();
      continue;
    }
    cur.push(line);
  }
  flush();
  return chunks;
}

/* Walk the lines, saying for each whether it is inside a fenced code
   block. A document that documents this tool is full of \page written as
   an example, and deleting those would be the tool eating its own
   reference. Everything here that touches markers goes through it. */
function walk(src, visit) {
  let fence = null;
  return src.split('\n').map((line) => {
    const f = line.match(/^\s*(```+|~~~+)/);
    const opening = f && !fence;
    if (f) {
      if (!fence) fence = f[1][0];
      else if (f[1][0] === fence) fence = null;
    }
    return visit(line, !!fence || !!opening);
  });
}

/* What a removed break leaves behind. An HTML comment draws nothing, so
   the document reads as though the break was simply deleted, and the
   options it was carrying are still sitting at the spot they applied to.
   The prefix is there so this is told apart from a comment somebody
   wrote. */
const NOTE = /^<!--[ \t]*brew:page[ \t]*(.*?)[ \t]*-->$/;

/** Take every page break out, remembering the ones that said something.
 *
 *  A bare break carried no decision, so it just goes. A break carrying
 *  options did carry one - this page opens on a background, that one is a
 *  single column - and deleting it would throw that away with no way back.
 *  Those leave a note where they stood, which renders as nothing and is
 *  turned back into the break it came from when breaks are added again.
 *
 *  Returns { markdown, removed, noted }. */
export function removeBreaks(src) {
  let removed = 0;
  let noted = 0;
  const out = walk(src, (line, fenced) => {
    if (fenced) return line;
    const m = line.match(PAGE_MARKER);
    if (!m) return line;
    removed += 1;
    const options = m[1].trim();
    if (!options) return null;
    noted += 1;
    return `<!-- brew:page ${options} -->`;
  }).filter((line) => line !== null);
  return {
    markdown: out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n',
    removed,
    noted,
  };
}

/** Join a block that was split across pages back into one.
 *
 *  The inverse of the cut fitBlock makes, and it has to exist: without it
 *  a second Add page breaks would treat each piece as a whole block, cut
 *  the pieces again, and the document would grow a new "(continued)"
 *  every time anyone pressed the button.
 *
 *  Fence-aware, because the reference guide writes ::: inside code
 *  samples to document itself, and a tool that eats its own manual is a
 *  tool nobody trusts twice.
 */
export function mergeContinuations(src) {
  const lines = src.split('\n');
  const out = [];
  let fence = null;
  let merged = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const f = line.match(/^\s*(```+|~~~+)/);
    if (f) {
      if (!fence) fence = f[1][0];
      else if (f[1][0] === fence) fence = null;
      out.push(line);
      continue;
    }
    if (!fence && BLOCK_CLOSE.test(line)) {
      // A close, then blank lines, then at most one page break, then
      // blank lines again - and if what follows that is a continuation
      // of the block just closed, the seam goes and the bodies join.
      let j = i + 1;
      while (j < lines.length && !lines[j].trim()) j++;
      if (j < lines.length && PAGE_MARKER.test(lines[j])) {
        j++;
        while (j < lines.length && !lines[j].trim()) j++;
      }
      if (j < lines.length && isContinuation(lines[j])) {
        out.push('');
        i = j;
        merged += 1;
        continue;
      }
    }
    out.push(line);
  }
  return { markdown: out.join('\n').replace(/\n{3,}/g, '\n\n'), merged };
}

/** Turn the notes left by removeBreaks back into the breaks they were. */
export function restoreNotes(src) {
  let restored = 0;
  const out = walk(src, (line, fenced) => {
    if (fenced) return line;
    const m = line.match(NOTE);
    if (!m) return line;
    restored += 1;
    return '\\page' + (m[1] ? ' ' + m[1] : '');
  });
  return { markdown: out.join('\n'), restored };
}

/* What a page's options mean for the sheets it spills onto.
 *
 * Almost nothing. A page that is too tall is one page in the author's
 * head, so the sheets after the first are the packer's doing, not a
 * decision anybody made, and they are written as bare breaks.
 *
 * Copying the options forward instead is what this used to do, and it was
 * wrong in three ways at once. \page folio=1 on a chapter opener that
 * split made every sheet of that chapter page 1. nofolio left the whole
 * chapter unnumbered. bg= stamped a ground the author had chosen for one
 * page across every page after it - which then made every break an
 * option-carrying break, so Remove breaks had to keep all of them and the
 * document could never be packed again.
 *
 * cols is the exception and has to carry: the content was measured in one
 * column, and letting the continuation fall back to two would lay it out
 * differently from the way it was fitted.
 *
 * A ground on every page is what \ground is for - one line, rather than
 * an option repeated on every break in the file. */
function spillOptions(options) {
  return (options && options.cols) ? { cols: options.cols } : {};
}

/* Write a page's options back out in the shape they were typed in.
   Flags - nofolio, and anything else written as a bare word - came in
   without a value and have to go out without one, or a re-break would
   quietly turn "nofolio" into "nofolio=true". */
function serialiseOptions(options) {
  const parts = Object.entries(options || {})
    .map(([k, v]) => (v === true ? k : `${k}=${v}`));
  return parts.length ? ' ' + parts.join(' ') : '';
}

function assemble(sheets, startsWithMarker) {
  return sheets
    .filter((s, i) => s.chunks.length || i > 0)
    .map((s, i) => {
      // The first sheet normally needs no marker, having started the file.
      // It does need one if it carries options: a document can open with a
      // \page that sets a background or one column, and writing that sheet
      // back out bare would delete what it asked for.
      const opening = i === 0 && !startsWithMarker
        && !Object.keys(s.options || {}).length;
      const marker = opening
        ? ''
        : '\\page' + serialiseOptions(s.options) + '\n\n';
      return marker + s.chunks.join('\n\n');
    })
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim() + '\n';
}

/* The least a split is worth doing for.
 *
 * A block only gets cut to fill a page if there is a real page to fill. A
 * short aside moved whole to the next sheet costs a few lines of white; a
 * short aside cut in half costs a reader the thread and puts a
 * "(continued)" card on the page for the sake of three lines. So the
 * block has to have somewhere to be cut, and each side has to be worth
 * carrying: at least two paragraphs stay behind and at least one goes on.
 * Entries - Gifts, Flaws, Resources, Boons - clear this easily. Callouts
 * almost never do, which is the intent. */
const SPLIT_MIN_PARAS = 4;
const SPLIT_MIN_HEAD = 2;

/** Split `chunk` so its first part finishes the sheet `cur` is filling.
 *
 *  Returns { head, tail } or null when there is no cut worth making. The
 *  packer's other split, fitBlock, answers "this cannot fit anywhere";
 *  this one answers "this does not fit HERE, and the rest of the page
 *  should not go white because of it" - which is how a printed reference
 *  has always been set.
 */
function fillSheet(cur, chunk, preamble, marker, container, render) {
  const lines = chunk.split('\n');
  const open = lines[0].match(BLOCK_OPEN);
  if (!open || !BLOCK_CLOSE.test(lines[lines.length - 1])) return null;

  // Nothing on the sheet yet means this is not a page being filled - it is
  // a block that will not fit a sheet at all, and any cut beats losing the
  // end of it off the edge. So the thresholds only apply when there is
  // something to fill behind.
  const filling = cur.length > 0;
  const minParas = filling ? SPLIT_MIN_PARAS : 2;
  const minHead = filling ? SPLIT_MIN_HEAD : 1;

  const paras = lines.slice(1, -1).join('\n').split(/\n\s*\n/).filter((p) => p.trim());
  if (paras.length < minParas) return null;

  const name = open[1];
  const raw = open[2].trim();
  const wasCont = raw.endsWith(CONTINUED.trim());
  const title = raw.replace(/ \(continued\)$/, '');
  const piece = (label, body) =>
    [`::: ${name}${label ? ' ' + label : ''}`, body, ':::'].join('\n');
  const headLabel = wasCont ? title + CONTINUED : title;

  // The most of this block that still fits behind what is already on the
  // sheet. Measured, not estimated - the sheet's own options are in the
  // marker, and a one-column page holds nothing like a two-column one.
  let take = 0;
  for (let n = minHead; n < paras.length; n++) {
    const trial = cur.concat([piece(headLabel, paras.slice(0, n).join('\n\n'))]);
    render(preamble + marker + trial.join('\n\n'), container);
    if (overhanging(container).length) break;
    take = n;
  }
  if (!take) return null;

  return {
    head: piece(headLabel, paras.slice(0, take).join('\n\n')),
    tail: piece(title + CONTINUED, paras.slice(take).join('\n\n')),
  };
}

/* A block taken apart, and put back together.
 *
 * The verify pass needs these. A piece that measured as fitting on its own
 * can still overhang once the document is assembled - POD alternates its
 * gutter by page parity and column rounding follows it - and when the
 * sheet holds nothing but that one block there is no whole chunk left to
 * move. The only thing to do is hand a paragraph back to the page after
 * it, which means opening the block up rather than treating it as opaque.
 */
function blockParts(chunk) {
  const lines = String(chunk).split('\n');
  const open = lines[0].match(BLOCK_OPEN);
  if (!open || !BLOCK_CLOSE.test(lines[lines.length - 1])) return null;
  return {
    name: open[1],
    label: open[2].trim(),
    paras: lines.slice(1, -1).join('\n').split(/\n\s*\n/).filter((p) => p.trim()),
  };
}

function blockFrom(name, label, paras) {
  return [`::: ${name}${label ? ' ' + label : ''}`, paras.join('\n\n'), ':::'].join('\n');
}

/** Indices of the pages standing taller than their sheet, as rendered. */
function overhanging(container) {
  const out = [];
  [...container.querySelectorAll('.page')].forEach((page, i) => {
    if (spills(page)) out.push(i);
  });
  return out;
}

/**
 * Re-break `src` so no page overflows, measuring in `container` - the live
 * preview, so the current layout, trim and theme are exactly what is used.
 *
 * Returns { markdown, added, stubborn }. `stubborn` names any page that is
 * still too tall while holding a single block, which no break can fix.
 */
/* The document's own settings, as lines.
 *
 * Every trial here is rendered as a fragment - a page marker and some
 * content - and a fragment does not carry the settings written at the top
 * of the file. That was harmless while those settings only chose a
 * background, and decisive the moment \cols existed: a one-column
 * document was being measured two columns wide, so twice as much appeared
 * to fit as really did, and the pages came out short. They ride along
 * with every measurement now. */
const DOC_MARKER = /^\\(?:folio|seed|ground|cols)\b/;

function preambleOf(src) {
  const lines = walk(src, (line, fenced) => (!fenced && DOC_MARKER.test(line) ? line : null))
    .filter((l) => l !== null);
  return lines.length ? lines.join('\n') + '\n\n' : '';
}

export async function autoPaginate(src, container, render) {
  await document.fonts.ready;
  const preamble = preambleOf(src);

  const startsWithMarker = PAGE_MARKER.test(src.split('\n').find((l) => l.trim()) || '');
  const zoom = container.style.getPropertyValue('--zoom');
  container.style.setProperty('--zoom', '1');   // always measure unscaled

  const original = paginate(src);
  const before = original.length;
  let split = 0;

  // --- first guess: fill each authored page until it spills ---
  const sheets = [];
  original.forEach((page) => {
    const marker0 = '\\page' + serialiseOptions(page.options) + '\n\n';
    // Cut anything taller than a sheet before packing, so every chunk the
    // packer sees is one it can actually place.
    const chunks = [];
    chunkPage(page.markdown).forEach((c) => chunks.push(c));
    if (!chunks.length) {
      sheets.push({ options: page.options, chunks: [] });
      return;
    }
    // Measure behind the page's own marker: a cols=1 page holds far less than
    // the two-column default, so measuring bare text would overfill it.
    const marker = '\\page' + serialiseOptions(page.options) + '\n\n';
    let cur = [];
    let first = true;
    const open = () => {
      const options = first ? page.options : spillOptions(page.options);
      first = false;
      return options;
    };
    chunks.forEach((chunk) => {
      // Does it fit behind what is already on the sheet - or, on an empty
      // sheet, does it fit at all? Asked first, always. Going straight to
      // the splitter cuts blocks that had no need to be cut.
      render(preamble + marker + cur.concat([chunk]).join('\n\n'), container);
      if (!overhanging(container).length) { cur.push(chunk); return; }
      // It will not fit behind what is already here. Rather than send the
      // whole block on and leave the rest of this sheet white, cut it so
      // its start finishes the page - and keep cutting while what is left
      // is still taller than a sheet of its own.
      let rest = chunk;
      for (let guard = 0; guard < MAX_PIECES; guard++) {
        const filled = fillSheet(cur, rest, preamble, marker, container, render);
        if (!filled) break;
        split += 1;
        sheets.push({ options: open(), chunks: cur.concat([filled.head]) });
        cur = [];
        rest = filled.tail;
        render(preamble + marker + rest, container);
        if (!overhanging(container).length) break;
      }
      if (cur.length) {
        // Nothing was cut. A heading stranded at the foot belongs with the
        // text it introduces, so it travels with it.
        const carried = [];
        while (cur.length && HEADING.test(cur[cur.length - 1])) carried.unshift(cur.pop());
        if (cur.length) sheets.push({ options: open(), chunks: cur });
        cur = carried;
      }
      cur.push(rest);
    });
    sheets.push({ options: open(), chunks: cur });
  });

  // --- verify against the whole document, and move what still overhangs ---
  let markdown = assemble(sheets, startsWithMarker);
  const stubborn = [];
  for (let pass = 0; pass < MAX_PASSES; pass++) {
    render(markdown, container);
    const bad = overhanging(container);
    if (!bad.length) break;

    // Work back to front so moving one page cannot shift the indices of the
    // ones still to be looked at.
    let moved = false;
    bad.reverse().forEach((i) => {
      const sheet = sheets[i];
      if (!sheet) return;
      if (sheet.chunks.length < 2) {
        // One block, still too tall now that it is measured in place. Give
        // its last paragraph to the page after it - joining the
        // continuation already there rather than starting a second one, or
        // the entry would arrive in three pieces to gain two lines.
        const parts = blockParts(sheet.chunks[0]);
        if (!parts || parts.paras.length < 2) return;
        const last = parts.paras.pop();
        sheet.chunks = [blockFrom(parts.name, parts.label, parts.paras)];
        const cont = parts.label.replace(/ \(continued\)$/, '') + CONTINUED;
        const next = sheets[i + 1];
        const after = next ? blockParts(next.chunks[0] || '') : null;
        if (after && after.name === parts.name && after.label === cont.trim()) {
          next.chunks[0] = blockFrom(parts.name, after.label, [last].concat(after.paras));
        } else {
          sheets.splice(i + 1, 0, {
            options: spillOptions(sheet.options),
            chunks: [blockFrom(parts.name, cont.trim(), [last])],
          });
        }
        moved = true;
        return;
      }
      const spill = [sheet.chunks.pop()];
      while (sheet.chunks.length && HEADING.test(sheet.chunks[sheet.chunks.length - 1])) {
        spill.unshift(sheet.chunks.pop());
      }
      const next = sheets[i + 1];
      // Never above a continuation: that sheet belongs to the block it
      // continues, and pushing other content in front of it separates the
      // two halves with something unrelated.
      if (next && !isContinuation(next.chunks[0] || '')
          && JSON.stringify(next.options) === JSON.stringify(sheet.options)) {
        next.chunks = spill.concat(next.chunks);
      } else {
        sheets.splice(i + 1, 0, { options: spillOptions(sheet.options), chunks: spill });
      }
      moved = true;
    });
    if (!moved) break;
    markdown = assemble(sheets, startsWithMarker);
  }

  // Anything left is a single block taller than a sheet - no break helps.
  render(markdown, container);
  overhanging(container).forEach((i) => {
    const sheet = sheets[i];
    const first = (sheet ? sheet.chunks[0] || '' : '').split('\n')[0];
    stubborn.push(first.slice(0, 60) || `page ${i + 1}`);
  });

  if (zoom) container.style.setProperty('--zoom', zoom);
  return {
    markdown,
    added: Math.max(0, sheets.filter((s) => s.chunks.length).length - before),
    stubborn,
    split,
  };
}
