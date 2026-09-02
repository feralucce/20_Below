/* Carry this module's version query down to its imports, so the whole
   graph busts together. See the note in index.html. */
const V = new URL(import.meta.url).search;
const { render } = await import('./render.js' + V);
const { guide, starter } = await import('./sample.js' + V);
const files = await import('./files.js' + V);

const editor   = document.getElementById('editor');
const preview  = document.getElementById('preview');
const status   = document.getElementById('status');
const fileIn   = document.getElementById('file');
const pageRule = document.getElementById('page-rule');

const DRAFT = '20below-brew-draft';
const PREFS = '20below-brew-prefs-v2';

/* Trim sizes. Adding one here is all that is needed - the value
 * feeds both the on-screen page and the injected @page rule. */
const TRIMS = {
  letter: { label: 'Letter 8.5 x 11', w: '8.5in',  h: '11in' },
  a4:     { label: 'A4 210 x 297',    w: '210mm',  h: '297mm' },
  trade:  { label: 'US Trade 6 x 9',  w: '6in',    h: '9in' },
  digest: { label: 'Digest 5.5 x 8.5',w: '5.5in',  h: '8.5in' },
};

const prefs = Object.assign(
  { palette: 'colour', layout: 'digital', trim: 'letter', zoom: 'fit' },
  load(PREFS) || {},
);

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
  const bleed = prefs.layout === 'pod' ? '0.125in' : '0in';
  pageRule.textContent =
    `@page { size: calc(${t.w} + ${bleed} * 2) calc(${t.h} + ${bleed} * 2); margin: 0; }`;
}

function applyPrefs() {
  const t = TRIMS[prefs.trim] || TRIMS.letter;
  preview.dataset.palette = prefs.palette === 'grey' ? 'grey' : 'colour';
  preview.dataset.layout  = prefs.layout  === 'pod'  ? 'pod'  : 'digital';
  preview.style.setProperty('--trim-w', t.w);
  preview.style.setProperty('--trim-h', t.h);
  document.getElementById('btn-palette').setAttribute('aria-pressed', prefs.palette === 'grey');
  document.getElementById('btn-layout').setAttribute('aria-pressed', prefs.layout === 'pod');
  document.getElementById('btn-palette').textContent =
    prefs.palette === 'grey' ? 'Greyscale' : 'Full colour';
  document.getElementById('btn-layout').textContent =
    prefs.layout === 'pod' ? 'POD (gutters + bleed)' : 'Digital';
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
  const avail = preview.clientWidth - 40;
  const natural = page.offsetWidth * (parseFloat(getComputedStyle(page).zoom) || 1);
  preview.style.setProperty('--zoom', natural ? Math.min(1, avail / natural).toFixed(3) : 1);
}
window.addEventListener('resize', applyZoom);

function draw() {
  const count = render(editor.value, preview);
  store(DRAFT, editor.value);
  const words = editor.value.trim() ? editor.value.trim().split(/\s+/).length : 0;
  status.textContent =
    `${count} page${count === 1 ? '' : 's'} · ${words} words · ${files.currentName()}`;
  applyZoom();
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

document.getElementById('btn-print').onclick = () => window.print();

document.getElementById('btn-palette').onclick = () => {
  prefs.palette = prefs.palette === 'grey' ? 'colour' : 'grey';
  applyPrefs();
};

document.getElementById('btn-layout').onclick = () => {
  prefs.layout = prefs.layout === 'pod' ? 'digital' : 'pod';
  applyPrefs();
};

document.getElementById('sel-trim').onchange = (e) => {
  prefs.trim = e.target.value;
  applyPrefs();
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
