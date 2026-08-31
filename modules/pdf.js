async function buildExportPDF(selected){
  const PDFLib = window.PDFLib;
  if(!PDFLib) throw new Error('PDF library is unavailable');
  const { PDFDocument, StandardFonts, rgb } = PDFLib;
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const makeColor = typeof rgb === 'function' ? rgb : (r,g,b)=>({r,g,b});
  const colors = { dark:makeColor(.08,.08,.1), body:makeColor(.2,.2,.22), faint:makeColor(.45,.45,.48), accent:makeColor(.86,.62,.16), line:makeColor(.84,.85,.87), headerBg:makeColor(.92,.93,.95), zebra:makeColor(.965,.966,.97) };
  const ctx = window.makePdfCtx(pdfDoc,font,fontBold,pdfDoc.getForm(),colors);
  const sections = {dashboard:window.pdfDashboard,kanban:window.pdfKanban,workload:window.pdfWorkload,projects:window.pdfProjects,team:window.pdfTeam,checkins:window.pdfCheckins,bills:window.pdfBills,agreements:window.pdfAgreements};
  selected.forEach(key=>{ if(sections[key]) sections[key](ctx); });
  window.pdfDisclaimer(ctx);
  const blob = new Blob([await pdfDoc.save()],{type:'application/pdf'}), url=URL.createObjectURL(blob), link=document.createElement('a');
  link.href=url; link.download='Management_Status.pdf'; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
}
window.buildExportPDF = buildExportPDF;
