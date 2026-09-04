/* Carry this module's version query down to its imports, so the whole
   graph busts together. See the note in index.html. */
const V = new URL(import.meta.url).search;
const { render } = await import('./render.js' + V);
const { autoPaginate, stripAutoBreaks } = await import('./autopage.js' + V);
const { guide, starter } = await import('./sample.js' + V);
const files = await import('./files.js' + V);

const editor   = document.getElementById('editor');
const preview  = document.getElementById('preview');
const status   = document.getElementById('status');
const fixPagesBtn = document.getElementById('btn-fixpages');
const reBreakBtn  = document.getElementById('btn-rebreak');
const fileIn   = document.getElementById('file');
const pageRule = document.getElementById('page-rule');

const DRAFT = '20below-brew-draft';
const PREFS = '20below-brew-prefs-v2';

/* Trim sizes. Adding one here is all that is needed - the value
 * feeds both the on-screen page and the injected @page rule. */
/* Output profiles. Digital is screen-only: no bleed, no gutter, even
 * margins. Both print profiles want the same page - a printer trims the top,
 * bottom and outside edges and cuts nothing at the spine, so bleed goes on
 * three edges, giving trim + 0.125in wide by trim + 0.25in tall. They are
 * kept apart because what they ask for around the page differs (PDF/X flavour,
 * colour profile), and because naming the shop you are exporting for is worth
 * more than one label reading "POD".
 *   KDP:        https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6
 *   DriveThru:  https://help.drivethrupartners.com/hc/en-us/articles/12780800178583
 */
const LAYOUTS = {
  digital:   { label: 'Digital',      bleed: '0in' },
  drivethru: { label: 'DriveThruRPG', bleed: '0.125in' },
  kdp:       { label: 'Amazon KDP',   bleed: '0.125in' },
};

const TRIMS = {
  letter: { label: 'Letter 8.5 x 11', w: '8.5in',  h: '11in' },
  a4:     { label: 'A4 210 x 297',    w: '210mm',  h: '297mm' },
  trade:  { label: 'US Trade 6 x 9',  w: '6in',    h: '9in' },
  digest: { label: 'Digest 5.5 x 8.5',w: '5.5in',  h: '8.5in' },
};

/* Themes. A theme is one setting or genre's look - colour and
 * typography together, defined in brew.css. Adding one means a block
 * pair there, an entry here, and nothing else.
 *
 * Themes are ours, not the reader's: a creator picks from this list
 * and cannot author their own, which is what keeps everything made
 * with this tool looking like the same product line. */
const THEMES = {
  core:      { label: '20 Below Core' },
  backwater: { label: 'Backwater Static' },
};

const prefs = Object.assign(
  { theme: 'core', palette: 'colour', layout: 'digital', trim: 'letter', zoom: 'fit' },
  load(PREFS) || {},
);
if (!THEMES[prefs.theme]) prefs.theme = 'core';

function load(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
}
function store(key, value) {
  try { localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value)); } catch {}
}

/* ---------- @page has to be injected: CSS variables do not work
   inside the size descriptor, and the bleed changes with layout. --- */
function applyPageRule() {
  const t = TRIMS[prefs.trim] || TRIMS.letter;
  const bleed = (LAYOUTS[prefs.layout] || LAYOUTS.digital).bleed;
  // One bleed on the width, two on the height - see LAYOUTS. Getting this
  // symmetric is what makes a printer reject the file or scale it.
  pageRule.textContent =
    `@page { size: calc(${t.w} + ${bleed}) calc(${t.h} + ${bleed} * 2); margin: 0; }`;
}

function applyPrefs() {
  const t = TRIMS[prefs.trim] || TRIMS.letter;
  preview.dataset.theme   = THEMES[prefs.theme] ? prefs.theme : 'core';
  preview.dataset.palette = prefs.palette === 'grey' ? 'grey' : 'colour';
  // 'pod' is the old two-way value. It put bleed on all four edges, which
  // neither printer wants; KDP is the closer heir since that geometry came
  // from an Amazon export.
  if (prefs.layout === 'pod') prefs.layout = 'kdp';
  if (!LAYOUTS[prefs.layout]) prefs.layout = 'digital';
  preview.dataset.layout = prefs.layout;
  preview.style.setProperty('--trim-w', t.w);
  preview.style.setProperty('--trim-h', t.h);
  document.getElementById('btn-palette').setAttribute('aria-pressed', prefs.palette === 'grey');
  document.getElementById('btn-palette').textContent =
    prefs.palette === 'grey' ? 'Greyscale' : 'Full colour';
  document.getElementById('sel-layout').value = prefs.layout;
  document.getElementById('sel-theme').value = prefs.theme;
  document.getElementById('sel-trim').value = prefs.trim;
  document.getElementById('sel-zoom').value = prefs.zoom;
  applyZoom();
  applyPageRule();
  store(PREFS, prefs);
}

/* "Fit" is recomputed against the pane, so it survives dragging the
   split and resizing the window. A fixed percentage is left alone. */
function applyZoom() {
  if (prefs.zoom !== 'fit') {
    preview.style.setProperty('--zoom', prefs.zoom);
    return;
  }
  const page = preview.querySelector('.page');
  if (!page) return;
  /* Measure at scale 1. offsetWidth already reflects the current zoom,
     so reading it while zoomed and dividing again compounds - which
     drove the value negative and silently disabled fitting. */
  preview.style.setProperty('--zoom', '1');
  const natural = page.offsetWidth;
  const avail = preview.clientWidth - 40;
  const zoom = natural > 0 && avail > 0 ? Math.min(1, avail / natural) : 1;
  preview.style.setProperty('--zoom', Math.max(0.1, zoom).toFixed(3));
}
window.addEventListener('resize', applyZoom);

/* A page is min-height, not fixed height, so too much content does not
 * get clipped - the page simply grows, and then spills across several
 * physical sheets when printed, with the margins and background of one.
 * Nothing is lost, but the page stops being a page. Mark any that have
 * outgrown the sheet so it is visible before printing. */
function flagOverflow() {
  // Measure unzoomed, whatever the preview is showing. Zoom scales the
  // layout, and column rounding shifts with it by a few pixels either way -
  // enough to flip the verdict on a page that only just fits. Print always
  // renders at zoom 1 (see brew.css), so that is the only measurement that
  // answers the question anyone is actually asking.
  const shown = preview.style.getPropertyValue('--zoom');
  preview.style.setProperty('--zoom', '1');
  let over = 0;
  for (const page of preview.querySelectorAll('.page')) {
    const sheet = parseFloat(getComputedStyle(page).minHeight) || 0;
    const spills = sheet > 0 && page.offsetHeight > sheet + 4;
    page.classList.toggle('overflowing', spills);
    if (spills) over += 1;
  }
  if (shown) preview.style.setProperty('--zoom', shown);
  return over;
}

function draw() {
  const count = render(editor.value, preview);
  store(DRAFT, editor.value);
  const words = editor.value.trim() ? editor.value.trim().split(/\s+/).length : 0;
  applyZoom();
  const over = flagOverflow();
  status.textContent =
    `${count} page${count === 1 ? '' : 's'} · ${words} words · ${files.currentName()}`
    + (over ? ` · ${over} page${over === 1 ? '' : 's'} longer than the sheet` : '');
  status.classList.toggle('warn', over > 0);
  // Only offered when there is something to fix - a break inserted into a
  // document that already fits would just be noise in the source.
  fixPagesBtn.hidden = over === 0;
}

let timer;
editor.addEventListener('input', () => {
  clearTimeout(timer);
  timer = setTimeout(draw, 120);
});

/* ---------- toolbar ---------- */
document.getElementById('btn-open').onclick = async () => {
  const text = await files.open(fileIn);
  if (text === null) return;
  editor.value = text;
  draw();
};

document.getElementById('btn-save').onclick = async () => {
  const saved = await files.save(editor.value);
  if (saved) status.textContent = `saved ${saved}`;
};

document.getElementById('btn-saveas').onclick = async () => {
  const saved = await files.save(editor.value, true);
  if (saved) status.textContent = `saved ${saved}`;
};

/* Insert the breaks the document is missing. Only ever adds them: a \page you
   wrote yourself keeps its place and its options. The result goes into the
   editor rather than anywhere hidden, so it can be read, saved and undone
   like anything else you typed. */
/* Insert the breaks the document is missing.
 *
 * Fix pages only ever ADDS: a \page you wrote yourself keeps its place and
 * its options, so nothing you decided deliberately can be moved.
 *
 * Re-break first strips the plain \page markers - the shape this tool writes -
 * and lays the document out again. That matters after a layout change: POD has
 * about 12% less room than digital, so breaks packed for one leave half-empty
 * pages in the other, and adding to them only makes more. Breaks carrying
 * options (cols=1, bg=parchment) are kept either way; a person typed those.
 *
 * Either way the result goes into the editor rather than anywhere hidden, so
 * it can be read, saved and undone like anything else you typed.
 */
async function repaginate(button, { fromScratch }) {
  const original = editor.value;
  const label = button.textContent;
  button.disabled = true;
  button.textContent = 'Working...';
  try {
    const src = fromScratch ? stripAutoBreaks(original) : original;
    const { markdown, added, stubborn } = await autoPaginate(src, preview, render);
    editor.value = markdown;
    draw();

    const parts = [];
    if (fromScratch) {
      const dropped = (original.match(/^\\page[ \t]*$/gm) || []).length;
      parts.push(`Re-broken from scratch${dropped ? `, dropping ${dropped} old break${dropped === 1 ? '' : 's'}` : ''}.`);
    }
    parts.push(added ? `Added ${added} page break${added === 1 ? '' : 's'}.` : 'Nothing to break.');
    if (stubborn.length) {
      parts.push(`${stubborn.length === 1 ? '1 block is' : stubborn.length + ' blocks are'} taller than a page alone, which no break can fix: ${stubborn.join('; ')}`);
    }
    status.textContent = parts.join(' ');
    status.classList.toggle('warn', stubborn.length > 0);
  } finally {
    button.disabled = false;
    button.textContent = label;
  }
}

fixPagesBtn.onclick = () => repaginate(fixPagesBtn, { fromScratch: false });
reBreakBtn.onclick = () => repaginate(reBreakBtn, { fromScratch: true });

document.getElementById('btn-print').onclick = () => window.print();

document.getElementById('sel-theme').onchange = (e) => {
  prefs.theme = e.target.value;
  applyPrefs();
  // A theme changes typography, so it changes how tall a page's text runs.
  draw();
};

document.getElementById('btn-palette').onclick = () => {
  prefs.palette = prefs.palette === 'grey' ? 'colour' : 'grey';
  applyPrefs();
};

document.getElementById('sel-layout').onchange = (e) => {
  prefs.layout = e.target.value;
  applyPrefs();
  // A print profile has roughly 12% less room than digital - bleed grows the
  // sheet but is trimmed off, while the gutter and safe inset come out of the
  // text block. Without this redraw the overflow flags would still describe
  // the geometry you just left.
  draw();
};

document.getElementById('sel-trim').onchange = (e) => {
  prefs.trim = e.target.value;
  applyPrefs();
  draw();
};

document.getElementById('sel-zoom').onchange = (e) => {
  prefs.zoom = e.target.value;
  applyPrefs();
};

/* Dragging the split changes the available width, so refit. */
document.getElementById('drag').addEventListener('mouseup', applyZoom);

document.getElementById('btn-new').onclick = () => {
  if (editor.value.trim() && !confirm('Start a new document? What is in the editor will be replaced.')) return;
  editor.value = starter();
  draw();
};

/* The reference opens in its own window so it can sit beside the
   document being written rather than replacing it. */
document.getElementById('btn-reference').onclick = () => {
  window.open('reference.html', '20below-brew-reference',
    'width=1100,height=900,menubar=no,toolbar=no');
};

/* Ctrl/Cmd+S saves rather than triggering the browser's page save. */
window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault();
    document.getElementById('btn-save').click();
  }
});

/* ---------- drag to resize the split ---------- */
document.getElementById('drag').addEventListener('mousedown', (e) => {
  e.preventDefault();
  const move = (ev) => {
    const pct = Math.min(75, Math.max(15, (ev.clientX / window.innerWidth) * 100));
    editor.style.flexBasis = pct + '%';
  };
  const up = () => {
    window.removeEventListener('mousemove', move);
    window.removeEventListener('mouseup', up);
  };
  window.addEventListener('mousemove', move);
  window.addEventListener('mouseup', up);
});

/* ---------- boot ---------- */
editor.value = load(DRAFT) || guide();
applyPrefs();
draw();
