export function downloadPdf(sheetElement, filenameBase) {
  if (!window.html2pdf) {
    alert('PDF export library failed to load (check your internet connection) - try the Markdown export instead.');
    return;
  }
  const filename = `${(filenameBase || 'character').replace(/[^a-z0-9-_]+/gi, '_')}.pdf`;
  window
    .html2pdf()
    .set({
      margin: 10,
      filename,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    })
    .from(sheetElement)
    .save();
}
