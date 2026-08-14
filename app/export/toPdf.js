// html2pdf.js's default DOM-based page-break logic ("avoid-all") is known
// to occasionally insert a fully blank page on content-heavy documents like
// this sheet (long Gift/Flaw level lists, big tables). Rather than fight
// that plugin's heuristics, this renders the sheet to one tall canvas and
// slices it into page-sized raster chunks by hand - simple, deterministic,
// and immune to the DOM-avoidance bug since no page-break decisions are
// made at all.

const MARGIN_MM = 10;
const SCALE = 1.5;
const JPEG_QUALITY = 0.85;
const BACKGROUND_COLOR = '#14161c'; // matches --bg in style.css
const BACKGROUND_RGB = [0x14, 0x16, 0x1c];

export async function downloadPdf(sheetElement, filenameBase) {
  if (!window.html2pdf) {
    alert('PDF export library failed to load (check your internet connection) - try the Markdown export instead.');
    return;
  }
  const filename = `${(filenameBase || 'character').replace(/[^a-z0-9-_]+/gi, '_')}.pdf`;

  const worker = window
    .html2pdf()
    .set({
      margin: MARGIN_MM,
      html2canvas: { scale: SCALE },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    })
    .from(sheetElement);

  const canvas = await worker.toCanvas().get('canvas');
  const pdf = await worker.toPdf().get('pdf'); // reuse for its constructor/page-size, discard its auto-paginated pages

  const pageWidthMM = pdf.internal.pageSize.getWidth();
  const pageHeightMM = pdf.internal.pageSize.getHeight();
  const usableWidthMM = pageWidthMM - MARGIN_MM * 2;
  const usableHeightMM = pageHeightMM - MARGIN_MM * 2;
  const pxPerMM = canvas.width / usableWidthMM;
  const pageHeightPx = Math.floor(usableHeightMM * pxPerMM);
  const totalPages = Math.ceil(canvas.height / pageHeightPx);

  while (pdf.internal.getNumberOfPages() > 1) {
    pdf.deletePage(pdf.internal.getNumberOfPages());
  }

  for (let i = 0; i < totalPages; i++) {
    const sliceHeightPx = Math.min(pageHeightPx, canvas.height - i * pageHeightPx);
    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceHeightPx;
    const ctx = sliceCanvas.getContext('2d');
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
    ctx.drawImage(canvas, 0, i * pageHeightPx, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);
    const imgData = sliceCanvas.toDataURL('image/jpeg', JPEG_QUALITY);
    if (i > 0) pdf.addPage();
    // Fill the full page first - a short last slice would otherwise leave
    // the page's own default white background showing past the image.
    pdf.setFillColor(...BACKGROUND_RGB);
    pdf.rect(0, 0, pageWidthMM, pageHeightMM, 'F');
    const sliceHeightMM = sliceHeightPx / pxPerMM;
    pdf.addImage(imgData, 'JPEG', MARGIN_MM, MARGIN_MM, usableWidthMM, sliceHeightMM);
  }

  pdf.save(filename);
}
