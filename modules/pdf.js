import * as sections from './pdf-sections.js';
export async function buildExportPDF(selected){
  const PDFLib = window.PDFLib;
  if(!PDFLib) throw new Error('PDFLib not available');
  const { PDFDocument, StandardFonts, rgb } = PDFLib;
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const form = pdfDoc.getForm();

  const rgbFn = (typeof rgb === 'function')
    ? rgb : (r,g,b)=>({r,g,b});

  const colors = {
    dark:  rgbFn(0.08, 0.08, 0.1),
    body:  rgbFn(0.20, 0.20, 0.22),
    dim:   rgbFn(0.45, 0.45, 0.48),
    faint: rgbFn(0.55, 0.55, 0.58),
    accent:rgbFn(0.86, 0.62, 0.16),
    line:  rgbFn(0.84, 0.85, 0.87),
    headerBg: rgbFn(0.92, 0.93, 0.95),
    zebra: rgbFn(0.965, 0.966, 0.97),
    flagUrgent: rgbFn(0.91,0.41,0.41),
    flagReviewed: rgbFn(0.54,0.64,1.0),
    flagRecurring: rgbFn(0.31,0.82,0.75),
    flagTaxExempt: rgbFn(0.61,0.43,0.89),
    flagFinal: rgbFn(0.95,0.72,0.31),
  };

  const ctx = window.makePdfCtx(pdfDoc, font, fontBold, form, colors);

  if(selected.includes('dashboard')) sections.pdfDashboard(ctx);
  if(selected.includes('kanban')) sections.pdfKanban(ctx);
  if(selected.includes('workload')) sections.pdfWorkload(ctx);
  if(selected.includes('projects')) sections.pdfProjects(ctx);
  if(selected.includes('team')) sections.pdfTeam(ctx);
  if(selected.includes('bills')) sections.pdfBills(ctx);
  if(selected.includes('agreements')) sections.pdfAgreements(ctx);

  if(!ctx.page) ctx.header('Ops Console', 'No sections were selected for export.');

  const bytes = await pdfDoc.save();
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Management_Status.pdf';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
