// PDF export. html2pdf is loaded lazily so it doesn't weigh down first paint.
export async function savePDF({ containerNo, fumDate }) {
  const certEl = document.getElementById('certificate');
  const safeContainer = (containerNo || 'certificate').replace(/[^\w-]+/g, '-');
  const filename = `fumigation-${safeContainer}-${fumDate || 'date'}.pdf`;

  try {
    const { default: html2pdf } = await import('html2pdf.js');
    await html2pdf()
      .set({
        margin: 8,
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(certEl)
      .save();
  } catch (e) {
    console.error('PDF export failed, falling back to print', e);
    window.print();
  }
}
