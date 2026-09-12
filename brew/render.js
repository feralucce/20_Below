/* markdown -> pages.
 *
 * Pagination is manual and always will be: browsers do not reflow
 * content into fixed-size pages, so the author says where a page
 * ends. A page marker is a line starting with \page, optionally
 * carrying options:
 *
 *   \page
 *   \page cols=2
 *   \page bg=hexdrift cols=1
 *   \page bg=https://your-host/cover.jpg tint=0.6
 *   \page nofolio
 *   \page folio=i          restart the count here, in roman
 *   \page folio=1          restart it here, in arabic
 *
 * And one marker that is not a page break at all:
 *
 *   \column                start the next column here
 *
 * Options apply to the page the marker STARTS. Unknown keys are
 * ignored, so adding new ones later cannot break old documents.
 *
 * There are two document-level directives, which apply wherever in the
 * file they sit:
 *
 *   \folio                 number the pages, on the outside edge
 *   \folio center start=5  centred, and this page counts as 5
 *   \folio off             the default, worth writing to say so
 *
 *   \seed 4815             draw this file's own grounds from that number
 *   \ground hex            every page gets this one unless it says otherwise
 *   \ground hex tint=0.4   and at this strength
 */

const V = new URL(import.meta.url).search;
const { applyBlocks } = await import('./blocks.js' + V);
const { maskUrl } = await import('./hexart.js' + V);

const PAGE_MARKER = /^\\page[ \t]*(.*)$/;
const FOLIO_MARKER = /^\\folio[ \t]*(.*)$/;
const SEED_MARKER = /^\\seed[ \t]*(.*)$/;
const GROUND_MARKER = /^\\ground[ \t]*(.*)$/;
/* Columns for the whole document.
 *
 * A page can already ask for one column with \page cols=1, and for a
 * document that wants one throughout that was the only way to say it -
 * which broke the thing it was trying to do. cols is the one option the
 * packer has to copy onto every sheet it spills, because content measured
 * in one column cannot be allowed to fall back to two. So every break in
 * the document ended up carrying an option, and a break carrying an
 * option is one Remove breaks must keep as a note rather than delete.
 * The document could never be laid out again from nothing: each pass
 * inherited the last pass's boundaries as fixed points and fragmented
 * further. Pressing Add page breaks twice made the book worse.
 *
 * Said once, at the top, none of that happens: the breaks stay bare, they
 * all come out, and the packer starts from the whole text every time. */
const COLS_MARKER = /^\\cols[ \t]+(\d+)[ \t]*$/;
const COLUMN_MARKER = /^\\column[ \t]*$/;

/* The textures that ship with the tool. Anything else in bg= is taken
   for a URL - see pageArt(). */
export const BUILT_IN_BG = ['none', 'hex', 'hexdrift', 'swarm'];

const PAIR = /([a-zA-Z][\w-]*)\s*=\s*("[^"]*"|\S+)/g;

function parseOptions(str) {
  const opts = {};
  const text = String(str || '');
  for (const m of text.matchAll(PAIR)) {
    opts[m[1].toLowerCase()] = m[2].replace(/^"|"$/g, '');
  }
  // Bare words are flags: nofolio, center, off. Read from the leftovers
  // after the pairs are removed, so a value is never mistaken for one.
  for (const m of text.replace(PAIR, ' ').matchAll(/[a-zA-Z][\w-]*/g)) {
    opts[m[0].toLowerCase()] = true;
  }
  return opts;
}

/* A background that is not one of ours is a URL. Vetted rather than
   trusted: this string ends up inside a CSS url(), and a document is
   something you might have been sent. Quotes, parens, backslashes and
   whitespace are what would let it break out, and a scheme we do not
   name is not allowed to run. */
function pageArt(value) {
  const url = String(value || '').trim();
  if (/["'()\\\s]/.test(url)) return null;
  if (/^(https?:\/\/|data:image\/)/i.test(url)) return url;
  if (/^[a-zA-Z][\w+.-]*:/.test(url)) return null;      // any other scheme
  return url;                                            // a relative path
}

/* \column - start the next column here.
 *
 * Content rather than a directive, so it stays in the page's body and in
 * the markdown a re-break assembles from. Both of those matter: it is a
 * decision about where a column ends, and neither Remove breaks nor Add
 * page breaks has any business moving it.
 *
 * Substituted before the markdown is parsed, because a bare \column line
 * would otherwise come out as a paragraph reading "column". Fenced code
 * is left alone so the reference can document this without breaking its
 * own columns. */
function columnBreaks(body) {
  let fence = null;
  return body.split('\n').map((line) => {
    const f = line.match(/^\s*(```+|~~~+)/);
    const opening = f && !fence;
    if (f) {
      if (!fence) fence = f[1][0];
      else if (f[1][0] === fence) fence = null;
    }
    if (fence || opening) return line;
    return COLUMN_MARKER.test(line) ? '<div class="column-break"></div>' : line;
  }).join('\n');
}

/** Split source into [{ options, markdown, body }] - one entry per printed
 *  page. `markdown` is the page's source as written; `body` is the same with
 *  document directives taken out, which is what actually gets rendered.
 *  Keeping both matters: re-pagination rebuilds the file from `markdown`,
 *  and a \folio line dropped there would be lost on the first Re-break.
 *
 *  Markers inside fenced code blocks are left alone, so a document can
 *  document its own syntax without splitting itself.
 *
 *  The document's own settings are returned as `.doc` on the array. */
export function paginate(src) {
  const pages = [{ options: {}, lines: [], body: [] }];
  const doc = {};
  let fence = null;
  for (const line of src.split(/\r?\n/)) {
    const f = line.match(/^\s*(```+|~~~+)/);
    if (f) {
      if (!fence) fence = f[1][0];
      else if (f[1][0] === fence) fence = null;
    }
    const page = !fence && line.match(PAGE_MARKER);
    if (page) {
      pages.push({ options: parseOptions(page[1]), lines: [], body: [] });
      continue;
    }
    const cur = pages[pages.length - 1];
    cur.lines.push(line);
    const folio = !fence && line.match(FOLIO_MARKER);
    const seed = !fence && line.match(SEED_MARKER);
    const ground = !fence && line.match(GROUND_MARKER);
    const cols = !fence && line.match(COLS_MARKER);
    if (folio) Object.assign(doc, parseOptions(folio[1]), { on: true });
    else if (seed) doc.seed = parseInt(seed[1], 10);
    else if (cols) doc.cols = cols[1];
    else if (ground) {
      // \ground hex tint=0.4 - the name first, then ordinary options.
      const rest = String(ground[1] || '').trim();
      const name = rest.split(/[ \t]+/)[0] || '';
      doc.ground = name;
      const opts = parseOptions(rest.slice(name.length));
      if (opts.tint !== undefined) doc.groundTint = opts.tint;
    } else cur.body.push(line);
  }
  // A marker on the first line leaves an empty page in front of it. That is
  // never what anyone meant - it is how a document says its opening page
  // wants a background or one column, which it otherwise has no way to ask
  // for. Any directives it held move onto the page that follows, so a
  // re-break still writes them back out.
  //
  // Dropped here rather than at render time on purpose: re-pagination
  // counts pages through this function and measures them in the preview,
  // and a list one longer than what is on screen would blame every
  // overflow on the page before it.
  if (pages.length > 1 && !pages[0].body.join('').trim()) {
    const lead = pages.shift();
    pages[0].lines = lead.lines.concat(pages[0].lines);
  }

  const out = pages.map((p) => ({
    options: p.options,
    markdown: p.lines.join('\n').trim(),
    body: p.body.join('\n').trim(),
  }));
  out.doc = doc;
  return out;
}

/* Roman numerals, for the front matter of a book.
 *
 * Which numbering a page uses is taken from how its number is written
 * rather than from a separate switch: folio=i is roman and folio=1 is
 * arabic. That is one idea instead of two, and it puts the answer in the
 * place you are already looking. */
const ROMAN = [[1000, 'm'], [900, 'cm'], [500, 'd'], [400, 'cd'], [100, 'c'],
  [90, 'xc'], [50, 'l'], [40, 'xl'], [10, 'x'], [9, 'ix'], [5, 'v'],
  [4, 'iv'], [1, 'i']];
const ROMAN_DIGIT = { i: 1, v: 5, x: 10, l: 50, c: 100, d: 500, m: 1000 };

function toRoman(n, upper) {
  // Only ever used for front matter, which never runs past a few dozen
  // pages. Anything a roman numeral cannot say is shown as itself.
  if (!Number.isFinite(n) || n < 1 || n > 3999) return String(n);
  let left = n;
  let out = '';
  for (const [value, sign] of ROMAN) {
    while (left >= value) { out += sign; left -= value; }
  }
  return upper ? out.toUpperCase() : out;
}

function fromRoman(text) {
  const t = text.toLowerCase();
  let n = 0;
  for (let i = 0; i < t.length; i++) {
    const here = ROMAN_DIGIT[t[i]];
    const next = ROMAN_DIGIT[t[i + 1]];
    n += next && here < next ? -here : here;
  }
  return n;
}

/** Read a written page number: 12, -7, i, XIV. Null if it is neither. */
function folioValue(text) {
  const written = String(text === undefined ? '' : text).trim();
  if (!written) return null;
  if (/^-?\d+$/.test(written)) {
    return { n: parseInt(written, 10), roman: false, upper: false };
  }
  if (/^[ivxlcdm]+$/i.test(written)) {
    const n = fromRoman(written);
    // Round-tripped, so xyz or iiii is rejected rather than quietly
    // renumbering the book from something it does not mean.
    if (n > 0 && toRoman(n, false) === written.toLowerCase()) {
      return { n, roman: true, upper: written === written.toUpperCase() };
    }
  }
  return null;
}

/** Is there more on this page than the sheet can hold?
 *
 *  Asked of the width, which looks wrong and is not. The text block has a
 *  definite height and column-fill:auto (see brew.css), so a page that is
 *  given too much does not get taller - it opens another column to the
 *  side, and the page's overflow:hidden cuts it off. Nothing grows, and
 *  nothing shows. Height stopped being able to answer this question the
 *  moment the columns were told to fill rather than balance.
 *
 *  One definition, used by the preview's warning and by the packer, so
 *  the two can never disagree about what fits. */
export function spills(page) {
  const flow = page.querySelector('.flow');
  if (!flow) return false;
  return flow.scrollWidth > flow.clientWidth + 4;
}

/** How the document numbers its pages: { on, where, from }. */
function folioSettings(doc) {
  const on = !!doc.on && !doc.off;
  const where = doc.center ? 'center' : 'outside';
  const from = folioValue(doc.start) || { n: 1, roman: false, upper: false };
  return { on, where, from };
}

/* Grounds drawn for this document, kept between renders.
 *
 * Re-pagination renders the document dozens of times while it measures,
 * and every keystroke renders it once more. Drawing a ground is a few
 * hundred polygons of string building - cheap once, not cheap sixty
 * times a page. Keyed by exactly what determines the drawing, so a hit
 * is always the same picture. */
const drawn = new Map();

function ground(name, seed, drift) {
  const key = name + ':' + seed + ':' + drift;
  if (!drawn.has(key)) drawn.set(key, maskUrl(name, seed, drift));
  return drawn.get(key);
}

/* Which ground each page wants, and with which seed.
 *
 * A seed on the page wins, then the document's, then none at all - which
 * means the file that ships with the tool. A page drawing from the
 * document's seed also gets a `drift`, its position among the pages
 * using that same ground, so a set progresses across the book instead of
 * merely differing page to page. A pinned page does not drift: it was
 * asked for exactly. */
/* Which ground a page ends up with. The page's own bg= wins, then the
   document's \ground line, then whatever the caller passed in. Written
   once and used by both grounds() and render(): the two disagreeing
   would draw one picture and label the page with another. */
export function pageBg(options, doc, defaults) {
  return String(options.bg || (doc && doc.ground) || defaults.bg || '');
}

function grounds(pages, defaults) {
  const docSeed = Number.isFinite(pages.doc && pages.doc.seed) ? pages.doc.seed : null;
  const runs = {};

  const wanted = pages.map(({ options }) => {
    const bg = pageBg(options, pages.doc, defaults);
    if (!bg || !BUILT_IN_BG.includes(bg) || bg === 'none') return null;
    const pinned = parseInt(options.seed, 10);
    if (Number.isFinite(pinned)) return { bg, seed: pinned, drift: 0 };
    if (docSeed === null) return { bg };
    runs[bg] = (runs[bg] || 0) + 1;
    // 7919 keeps the per-page seeds far enough apart that two pages of
    // the same ground never share a drawing by accident.
    return { bg, seed: docSeed + runs[bg] * 7919, place: runs[bg] - 1 };
  });

  // Drift can only be worked out once the whole run is known: it is a
  // page's place along that ground's run, from 0 to 1.
  return wanted.map((w) => {
    if (!w || w.seed === undefined || w.place === undefined) return w;
    const last = runs[w.bg] - 1;
    // Quantised to sixteenths. Re-pagination changes the page count on
    // every pass, which moves every drift a little and would otherwise
    // miss the cache and redraw the whole book each time round.
    const drift = last > 0 ? Math.round((w.place / last) * 16) / 16 : 0;
    return { bg: w.bg, seed: w.seed, drift };
  });
}

/* A block the author chose to break across a page.
 *
 * Writing \page inside a ::: block is how you say "cut this entry here" -
 * how you put the start of the next one at the foot of a page instead of
 * leaving half a sheet white. paginate() splits at the marker wherever it
 * falls, so without this the first page ends with the block still open
 * and the second begins with its body loose and a stray close. Neither
 * renders: an unmatched ::: is deliberately left visible, so the page
 * fills with colons instead of with an entry.
 *
 * Open blocks are closed at the foot of the page and reopened at the head
 * of the next, marked (continued) - the same mark the packer puts on the
 * ones it has to cut itself, because to a reader they are the same thing.
 *
 * Done here rather than in paginate() deliberately. This is how the page
 * is drawn, not what the document says, and Add page breaks reads the
 * document back out through paginate() to rebuild it. Rewriting it there
 * would turn the author's single marker into two blocks in their own file
 * the first time they pressed that button - and the press after that
 * would see a (continued) block, take it for one of the packer's, and
 * merge it away.
 */
const BLOCK_HEAD = /^(:::[ \t]*[a-zA-Z][\w-]*(?:\.[a-zA-Z][\w-]*)?)[ \t]*(.*)$/;
const BLOCK_TAIL = /^:::[ \t]*$/;

function continuedHead(openLine) {
  const m = openLine.match(BLOCK_HEAD);
  if (!m) return openLine;
  const title = m[2].trim().replace(/\s*\(continued\)$/, '');
  return m[1] + ' ' + (title ? title + ' (continued)' : '(continued)');
}

function carryBlocks(pages) {
  let stack = [];                    // opens still unclosed, outermost first
  for (const page of pages) {
    const reopen = stack.slice();
    let fence = null;
    for (const line of page.body.split('\n')) {
      const f = line.match(/^\s*(```+|~~~+)/);
      if (f) {
        if (!fence) fence = f[1][0];
        else if (f[1][0] === fence) fence = null;
        continue;
      }
      if (fence) continue;
      if (BLOCK_TAIL.test(line)) { if (stack.length) stack.pop(); continue; }
      if (BLOCK_HEAD.test(line)) stack.push(line);
    }
    if (!reopen.length && !stack.length) continue;
    const head = reopen.map((l) => continuedHead(l) + '\n\n').join('');
    const tail = stack.map(() => '\n\n:::').join('');
    page.body = head + page.body + tail;
  }
}

/* A wide block trapped inside a card.
 *
 * ::: wide means "break out of the columns", and a spanning element
 * applies to the nearest multi-column ancestor - which is the page's
 * text flow, never the card it happens to be written inside. So a table
 * written into a Gift entry asks to span the whole page from within the
 * entry, and the browser settles that by inflating the card: one measured
 * 68% of the page where its contents needed 39%, and the flow fragmented
 * sideways as though the page had overflowed. The packer believed it and
 * stopped the entry short, leaving two fifths of the sheet white.
 *
 * Turning the span off inside cards was the obvious answer and it was
 * wrong. Confined to a card's width, the largest of these tables wraps
 * itself taller than a whole page, and a card is one object - so the
 * entry became unplaceable and a page overflowed outright. The table does
 * not merely prefer the full width, it needs it.
 *
 * So the table comes out of the card instead. The card closes above it,
 * the table stands at the top level where its span means something, and
 * the card reopens under it without repeating its name - this is one
 * entry running down one page, not a page turn, and a second heading
 * would say otherwise. A label sitting directly above the table travels
 * with it, because a label belongs to what it introduces.
 *
 * Done here rather than in the source: it is how the page is drawn, and
 * Add page breaks reads the document back out through paginate() to
 * rebuild it. Restructuring it there would rewrite the author's file.
 */
const WIDE_OPEN = /^:::[ \t]*wide\b[^\n]*$/;
const BLOCK_ANY_OPEN = /^:::[ \t]*[a-zA-Z]/;
const LABEL_LINE = /^\*\*[^*\n]+\*\*:?$/;

function hoistWide(body) {
  const lines = body.split('\n');
  const out = [];
  const stack = [];
  let fence = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const f = line.match(/^\s*(```+|~~~+)/);
    if (f) {
      if (!fence) fence = f[1][0];
      else if (f[1][0] === fence) fence = null;
      out.push(line);
      continue;
    }
    if (fence) { out.push(line); continue; }

    if (WIDE_OPEN.test(line) && stack.length) {
      let depth = 1;
      let j = i + 1;
      const inner = [];
      for (; j < lines.length; j++) {
        if (BLOCK_ANY_OPEN.test(lines[j])) depth += 1;
        else if (BLOCK_TAIL.test(lines[j])) {
          depth -= 1;
          if (!depth) break;
        }
        inner.push(lines[j]);
      }

      while (out.length && !out[out.length - 1].trim()) out.pop();
      let label = '';
      if (out.length && LABEL_LINE.test(out[out.length - 1].trim())) label = out.pop();
      while (out.length && !out[out.length - 1].trim()) out.pop();

      for (let k = 0; k < stack.length; k++) out.push('', ':::');
      out.push('', '::: wide');
      if (label) out.push(label, '');
      inner.forEach((l) => out.push(l));
      out.push(':::');
      for (const open of stack) {
        const m = open.match(BLOCK_HEAD);
        out.push('', m ? m[1] : open);
      }
      i = j;
      continue;
    }

    if (BLOCK_ANY_OPEN.test(line)) { stack.push(line); out.push(line); continue; }
    if (BLOCK_TAIL.test(line)) { stack.pop(); out.push(line); continue; }
    out.push(line);
  }
  return out.join('\n');
}

/** Render source into the container as a series of .page elements. */
export function render(src, container, defaults = {}) {
  const pages = paginate(src);
  for (const page of pages) page.body = hoistWide(page.body);
  carryBlocks(pages);
  const folio = folioSettings(pages.doc || {});
  const art = grounds(pages, defaults);

  // One rule per distinct drawing rather than a data URI on every page.
  // Two hundred pages of inline mask would be several megabytes of
  // attribute text saying the same handful of things.
  const rules = new Map();

  // Runs through the whole document, so an unnumbered page still advances
  // it and a page that restarts the count carries every page after it.
  let count = folio.from;

  container.innerHTML = pages
    .map(({ options, body }, i) => {
      // Two columns unless the page asks for one. Not a tool setting:
      // a saved preference must never silently restyle a document.
      // A page may still override the document, which is how a single
      // spread opens full width in an otherwise two-column book.
      const cols = options.cols || (pages.doc || {}).cols || defaults.cols || '2';
      const bg = pageBg(options, pages.doc, defaults);
      const attrs = [`data-cols="${cols}"`];
      const styles = [];

      if (bg) {
        if (BUILT_IN_BG.includes(bg)) {
          attrs.push(`data-bg="${bg}"`);
          const want = art[i];
          if (want && want.seed !== undefined) {
            const id = `${want.bg}-${want.seed}-${Math.round(want.drift * 1000)}`;
            if (!rules.has(id)) rules.set(id, ground(want.bg, want.seed, want.drift));
            attrs.push(`data-art="${id}"`);
          }
        } else {
          const url = pageArt(bg);
          // A background that cannot be vetted is dropped rather than
          // guessed at, and the page renders without it.
          if (url) {
            attrs.push('data-bg="image"');
            styles.push(`--page-art:url('${url}')`);
          }
        }
        // A page's own tint, else the one the \ground line set for the
        // whole document.
        const tint = parseFloat(
          options.tint !== undefined ? options.tint
            : (pages.doc || {}).groundTint);
        if (Number.isFinite(tint)) {
          styles.push(`--bg-tint:${Math.min(1, Math.max(0, tint))}`);
        }
      }

      // A page can restart the count, which is how a book gets its roman
      // front matter and then an arabic chapter one. Writing folio=i or
      // folio=1 says both where the count resumes and which numbering it
      // resumes in.
      const restart = folioValue(options.folio);
      if (restart) count = restart;

      // Which side of the spine this page falls on, from its number
      // rather than from its place in the file.
      //
      // That distinction is the whole reason a book can be split across
      // several documents. A chapter that opens on page 12 is a verso: it
      // wants its gutter on the right and its folio on the left, and the
      // page after it wants the opposite. Counting from the top of the
      // file instead would mirror every page in that chapter and put the
      // binding margin on the outside edge, which is not something a
      // proof reveals until it is printed and bound.
      //
      // A document that never sets a number starts at 1, so nothing that
      // already existed moves.
      attrs.push(`data-side="${count.n % 2 ? 'recto' : 'verso'}"`);

      // An unnumbered page still counts - a plate or a title page takes
      // its place in the sequence, it just does not say so.
      let number = '';
      if (folio.on) {
        attrs.push(`data-folio="${folio.where}"`);
        if (!options.nofolio) {
          const shown = count.roman ? toRoman(count.n, count.upper) : String(count.n);
          number = `<div class="folio">${shown}</div>`;
        }
      }
      count = { n: count.n + 1, roman: count.roman, upper: count.upper };

      if (styles.length) attrs.push(`style="${styles.join(';')}"`);
      const html = window.marked.parse(applyBlocks(columnBreaks(body)));
      return `<div class="page" ${attrs.join(' ')}>`
        + `<div class="flow">${html}</div>${number}</div>`;
    })
    .join('');

  applyArt(container, rules);
  return pages.length;
}

/* Park the drawn grounds in a stylesheet of their own, beside the
 * container. Written as custom properties rather than as mask rules, so
 * they set a value brew.css already reads and there is no specificity
 * race with it. Cleared when a document stops asking for any, so an
 * edited-away ground does not linger in the document. */
function applyArt(container, rules) {
  const doc = container.ownerDocument;
  let sheet = doc.getElementById('brew-art');
  if (!rules.size) {
    if (sheet) sheet.textContent = '';
    return;
  }
  if (!sheet) {
    sheet = doc.createElement('style');
    sheet.id = 'brew-art';
    doc.head.appendChild(sheet);
  }
  sheet.textContent = [...rules]
    .map(([id, url]) => `.page[data-art="${id}"]{--page-mask:${url}}`)
    .join('\n');
}
