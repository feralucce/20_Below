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
const { paginate } = await import('./render.js' + V);

const PAGE_MARKER = /^\\page[ \t]*(.*)$/;
const HEADING = /^#{1,6} /;
const MAX_PASSES = 6;

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

/* Drop the breaks that carry no options, keeping any that do.
 *
 * A bare \page is the shape this tool writes, so re-running after a layout
 * change would otherwise pile new breaks on top of stale ones and leave a
 * trail of half-empty pages. A break carrying options - cols=1, bg=parchment -
 * was typed by a person for a reason, and is never touched. */
export function stripAutoBreaks(src) {
  const PLAIN = /^\\page[ \t]*$/;
  return src
    .split('\n')
    .filter((line) => !PLAIN.test(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
}

function serialiseOptions(options) {
  const parts = Object.entries(options || {}).map(([k, v]) => `${k}=${v}`);
  return parts.length ? ' ' + parts.join(' ') : '';
}

function assemble(sheets, startsWithMarker) {
  return sheets
    .filter((s, i) => s.chunks.length || i > 0)
    .map((s, i) => {
      const marker = (i === 0 && !startsWithMarker)
        ? ''
        : '\\page' + serialiseOptions(s.options) + '\n\n';
      return marker + s.chunks.join('\n\n');
    })
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim() + '\n';
}

/** Indices of the pages standing taller than their sheet, as rendered. */
function overhanging(container) {
  const out = [];
  [...container.querySelectorAll('.page')].forEach((page, i) => {
    const sheet = parseFloat(getComputedStyle(page).minHeight) || 0;
    if (sheet > 0 && page.offsetHeight > sheet + 4) out.push(i);
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
export async function autoPaginate(src, container, render) {
  await document.fonts.ready;

  const startsWithMarker = PAGE_MARKER.test(src.split('\n').find((l) => l.trim()) || '');
  const zoom = container.style.getPropertyValue('--zoom');
  container.style.setProperty('--zoom', '1');   // always measure unscaled

  const original = paginate(src);
  const before = original.length;

  // --- first guess: fill each authored page until it spills ---
  const sheets = [];
  original.forEach((page) => {
    const chunks = chunkPage(page.markdown);
    if (!chunks.length) {
      sheets.push({ options: page.options, chunks: [] });
      return;
    }
    // Measure behind the page's own marker: a cols=1 page holds far less than
    // the two-column default, so measuring bare text would overfill it.
    const marker = '\\page' + serialiseOptions(page.options) + '\n\n';
    let cur = [];
    chunks.forEach((chunk) => {
      if (!cur.length) { cur.push(chunk); return; }
      render(marker + cur.concat([chunk]).join('\n\n'), container);
      if (!overhanging(container).length) { cur.push(chunk); return; }
      const carried = [];
      while (cur.length && HEADING.test(cur[cur.length - 1])) carried.unshift(cur.pop());
      if (cur.length) sheets.push({ options: page.options, chunks: cur });
      cur = carried.concat([chunk]);
    });
    sheets.push({ options: page.options, chunks: cur });
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
      if (!sheet || sheet.chunks.length < 2) return;   // nothing left to move
      const spill = [sheet.chunks.pop()];
      while (sheet.chunks.length && HEADING.test(sheet.chunks[sheet.chunks.length - 1])) {
        spill.unshift(sheet.chunks.pop());
      }
      const next = sheets[i + 1];
      if (next && JSON.stringify(next.options) === JSON.stringify(sheet.options)) {
        next.chunks = spill.concat(next.chunks);
      } else {
        sheets.splice(i + 1, 0, { options: sheet.options, chunks: spill });
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
  return { markdown, added: Math.max(0, sheets.filter((s) => s.chunks.length).length - before), stubborn };
}
