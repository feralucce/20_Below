// Standalone HTML export, and browser-native print-to-PDF built on the same
// document. Both take the print sheet's DOM element, inline the app's own
// stylesheet plus a few print-specific rules (page margins, break-inside
// avoidance on cards/rows so nothing splits mid-element), and produce one
// self-contained HTML page - no build step, no canvas rasterization.

const PRINT_CSS = `
@page { margin: 12mm; }
@media print {
  html, body {
    background: var(--bg);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
body { padding: 1.5rem; }
.sheet { border: none; }
.attr-card, .field-box, .figured-box, table, tr, .sheet li {
  break-inside: avoid;
}
.sheet h3 {
  break-after: avoid;
}
`;

let cachedCss = null;

async function fetchStyleCss() {
  if (cachedCss) return cachedCss;
  const res = await fetch(new URL('../style.css', import.meta.url));
  cachedCss = await res.text();
  return cachedCss;
}

function buildDocument(sheetHtml, cssText, title) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
${cssText}
${PRINT_CSS}
</style>
</head>
<body>
${sheetHtml}
</body>
</html>
`;
}

async function buildStandaloneDocument(sheetElement, filenameBase) {
  const cssText = await fetchStyleCss();
  const title = `${filenameBase || 'Character'} - Character Sheet`;
  return buildDocument(sheetElement.outerHTML, cssText, title);
}

export async function downloadHtml(sheetElement, filenameBase) {
  const doc = await buildStandaloneDocument(sheetElement, filenameBase);
  const filename = `${(filenameBase || 'character').replace(/[^a-z0-9-_]+/gi, '_')}.html`;
  const blob = new Blob([doc], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function printToPdf(sheetElement, filenameBase) {
  // window.open must run synchronously inside the click handler, before any
  // await - once control yields to the microtask queue (the style.css
  // fetch below), the call is no longer inside the user-gesture chain and
  // browsers silently block it as a popup.
  const win = window.open('', '_blank');
  if (!win) {
    alert('Pop-up blocked - allow pop-ups for this site, or use Download HTML and print from the downloaded file instead.');
    return;
  }
  const doc = await buildStandaloneDocument(sheetElement, filenameBase);
  win.document.open();
  win.document.write(doc);
  win.document.close();
  win.focus();
  // document.write's load isn't reliably observable across browsers here,
  // so a short fixed delay stands in for "styles and layout have settled."
  setTimeout(() => win.print(), 300);
}
