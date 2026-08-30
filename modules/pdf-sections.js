const PAGE_W = 612, PAGE_H = 792, MARGIN = 50;
const CONTENT_W = PAGE_W - MARGIN * 2;

function sanitizePdfText(text){
  return String(text == null ? '' : text)
    export const PAGE_W = 612, PAGE_H = 792, MARGIN = 50;
    export const CONTENT_W = PAGE_W - MARGIN * 2;

    export function sanitizePdfText(text){
      return String(text == null ? '' : text)
        .replace(/₹/g, 'Rs.')
        .replace(/→/g, '-')
        .replace(/·/g, '-')
        .replace(/[^\x20-\x7E\u00A0-\u00FF\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u2026]/g, '-');
    }

    export function wrapText(font, text, size, maxWidth){
      text = sanitizePdfText(text);
      const words = text.split(/\s+/).filter(Boolean);
      const lines = [];
      let line = '';
      for(const word of words){
        const test = line ? line + ' ' + word : word;
        try{
          if(line && font && typeof font.widthOfTextAtSize === 'function' && font.widthOfTextAtSize(test, size) > maxWidth){
            lines.push(line);
            line = word;
          } else {
            line = test;
          }
        }catch(e){
          if(line.length + word.length + 1 > Math.floor(maxWidth / (size * 0.6))){ lines.push(line); line = word; } else { line = test; }
        }
      }
      if(line) lines.push(line);
      return lines.length ? lines : [''];
    }

    export function makePdfCtx(pdfDoc, font, fontBold, form, colors){
      return {
        pdfDoc, font, fontBold, form, colors,
        page: null,
        y: 0,
        newPage(){ this.page = this.pdfDoc.addPage([PAGE_W, PAGE_H]); this.y = PAGE_H - MARGIN; },
        ensureSpace(needed){ if(!this.page || this.y < MARGIN + needed) this.newPage(); },
        header(title, sub){ this.newPage(); this.page.drawText(sanitizePdfText(title), { x: MARGIN, y: this.y, size: 18, font: this.fontBold, color: this.colors.dark }); this.y -= 18; if(sub){ this.page.drawText(sanitizePdfText(sub), { x: MARGIN, y: this.y, size: 9, font: this.font, color: this.colors.faint }); this.y -= 12; } this.page.drawLine({ start:{ x: MARGIN, y: this.y }, end:{ x: PAGE_W - MARGIN, y: this.y }, thickness: 1, color: this.colors.line }); this.y -= 14; },
        sectionTitle(title){ this.ensureSpace(24); this.page.drawText(sanitizePdfText(title), { x: MARGIN, y: this.y, size: 12.5, font: this.fontBold, color: this.colors.accent }); this.y -= 18; },
        paragraph(text, size = 9.5, color = null, lineHeight = 13){ const c = color || this.colors.body; const lines = wrapText(this.font, text, size, CONTENT_W); for(const line of lines){ this.ensureSpace(lineHeight); this.page.drawText(line, { x: MARGIN, y: this.y, size, font: this.font, color: c }); this.y -= lineHeight; } },
      };
    }

    export function drawTable(ctx, headers, rows, widths, opts = {}){
      const fontSize = opts.fontSize || 9;
      const headerSize = opts.headerSize || 8.5;
      const rowPad = 5;
      const tableLeft = MARGIN;
      const tableRight = PAGE_W - MARGIN;
      const totalWidth = tableRight - tableLeft;
      const sum = widths.reduce((a,b)=>a+b,0) || widths.length;
      const cols = widths.map(w => (w / sum) * totalWidth);
      const { colors } = ctx;

      const wrapCell = (text, f, s, w) => wrapText(f, text, s, Math.max(w - 4, 24));
      const headerLines = headers.map((h,i) => wrapCell(h, ctx.fontBold, headerSize, cols[i]));
      const headerHeight = Math.max(1, ...headerLines.map(l=>l.length)) * (headerSize + 3) + rowPad * 2;

      const rowsData = rows.map(r => { const cells = r.map((val,i)=> wrapCell(String(val||''), ctx.font, fontSize, cols[i])); const height = Math.max(1, ...cells.map(c=>c.length)) * (fontSize + 3) + rowPad * 2; return { cells, height }; });

      const drawHeader = ()=>{ const yTop = ctx.y; ctx.page.drawRectangle({ x: tableLeft, y: yTop - headerHeight, width: totalWidth, height: headerHeight, color: colors.headerBg }); let cx = tableLeft; headerLines.forEach((lines,i)=>{ let ty = yTop - rowPad - headerSize; lines.forEach(line=>{ ctx.page.drawText(line, { x: cx + 4, y: ty, size: headerSize, font: ctx.fontBold, color: colors.dark }); ty -= headerSize + 3; }); cx += cols[i]; }); ctx.y -= headerHeight; };

      ctx.ensureSpace(headerHeight + 14); drawHeader();
      rowsData.forEach((rd, ri)=>{ const prev = ctx.page; ctx.ensureSpace(rd.height); if(ctx.page !== prev) drawHeader(); const yTop = ctx.y; if(ri % 2 === 1){ ctx.page.drawRectangle({ x: tableLeft, y: yTop - rd.height, width: totalWidth, height: rd.height, color: colors.zebra }); } ctx.page.drawLine({ start:{ x: tableLeft, y: yTop }, end:{ x: tableRight, y: yTop }, thickness: 0.5, color: colors.line }); let cx = tableLeft; rd.cells.forEach((lines,i)=>{ let ty = yTop - rowPad - fontSize; lines.forEach(line=>{ ctx.page.drawText(line, { x: cx + 4, y: ty, size: fontSize, font: ctx.font, color: colors.body }); ty -= fontSize + 3; }); cx += cols[i]; }); ctx.y -= rd.height; }); ctx.page.drawLine({ start:{ x: tableLeft, y: ctx.y }, end:{ x: tableRight, y: ctx.y }, thickness: 0.5, color: colors.line }); ctx.y -= 12; }

    // Minimal section renderers
    export function pdfDashboard(ctx){ ctx.header('Dashboard', 'SNAPSHOT — ' + new Date().toDateString().toUpperCase()); ctx.sectionTitle('Summary'); ctx.paragraph('This PDF contains project and task summaries.', 10); }
    export function pdfKanban(ctx){ ctx.header('Kanban', 'Tickets by status'); ctx.paragraph('Kanban snapshot exported from the app.', 10); }
    export function pdfWorkload(ctx){ ctx.header('Workload', 'Team workload'); ctx.paragraph('Workload summary per teammate.', 10); }
    export function pdfProjects(ctx){ ctx.header('Projects', 'Project progress'); ctx.paragraph('Project list with progress.', 10); }
    export function pdfTeam(ctx){ ctx.header('Team', 'Team members'); ctx.paragraph('Team members and capacity.', 10); }
    export function pdfBills(ctx){ ctx.header('Bills', 'Invoices'); ctx.paragraph('Invoice summaries.', 10); }
    export function pdfAgreements(ctx){ ctx.header('Agreements', 'Contracts & NDAs'); ctx.paragraph('Agreements and terms.', 10); }
  const totalBilled = window.state.bills.reduce((s, b) => s + window.calcBillTotal(b), 0);
  const paidBilled = window.state.bills.filter(b => b.status === 'paid').reduce((s, b) => s + window.calcBillTotal(b), 0);
  const outstanding = window.state.bills.filter(b => b.status === 'sent' || b.status === 'overdue').reduce((s, b) => s + window.calcBillTotal(b), 0);

  ctx.sectionTitle('Ticker');
  drawTable(ctx,
    ['Metric', 'Value'],
    [
      ['Active tasks', String(total - doneCount)],
      ['In progress', String(inProgress)],
      ['Overdue tasks', String(overdue)],
      ['Completed', String(doneCount)],
      ['Billed', String(window.formatCurrency(totalBilled))],
      ['Paid', String(window.formatCurrency(paidBilled))],
      ['Outstanding', String(window.formatCurrency(outstanding))],
    ],
    [3, 1]);

  ctx.sectionTitle('Tasks by status');
  drawTable(ctx,
    ['Status', 'Count'],
    window.STATUS_COLS.map(s => [s.label, String(window.state.tasks.filter(t => t.status === s.key).length)]),
    [3, 1]);

  ctx.sectionTitle('Workload by teammate');
  drawTable(ctx,
    ['Teammate', 'Role', 'Active hrs', 'Capacity'],
    window.state.members.map(m => [
      m.name, m.role,
      String(window.state.tasks.filter(t => t.assigneeId === m.id && t.status !== 'done').reduce((a, t) => a + t.hours, 0)),
      String(m.capacity) + 'h',
    ]),
    [2, 2.4, 1.1, 1]);

  ctx.sectionTitle('Project progress');
  drawTable(ctx,
    ['Project', 'Done', 'Total', '% Complete'],
    window.state.projects.map(p => {
      const tasks = window.state.tasks.filter(t => t.projectId === p.id);
      const done = tasks.filter(t => t.status === 'done').length;
      return [p.name, String(done), String(tasks.length), tasks.length ? Math.round(done / tasks.length * 100) + '%' : '0%'];
    }),
    [3, 1, 1, 1.2]);
}

function pdfKanban(ctx){
  ctx.header('Kanban', 'TICKETS GROUPED BY STATUS — ' + window.state.tasks.length + ' TOTAL');
  window.STATUS_COLS.forEach(col => {
    const tasks = window.state.tasks.filter(t => t.status === col.key);
    if(!tasks.length) return;
    ctx.sectionTitle(col.label + '  (' + tasks.length + ')');
    tasks.forEach(t => {
      ctx.ensureSpace(38);
      const cb = ctx.form.createCheckBox('chk_' + t.id);
      cb.addToPage(ctx.page, { x: MARGIN, y: ctx.y - 9, width: 11, height: 11, borderColor: ctx.colors.dim, borderWidth: 1 });
      if(t.status === 'done') cb.check();
      const m = window.member(t.assigneeId), p = window.project(t.projectId);
      ctx.page.drawText(t.id, { x: MARGIN + 16, y: ctx.y, size: 8.5, font: ctx.font, color: ctx.colors.dim });
      ctx.page.drawText(sanitizePdfText(t.title), { x: MARGIN + 66, y: ctx.y, size: 10, font: ctx.fontBold, color: ctx.colors.dark });
      ctx.y -= 12;
      ctx.page.drawText(
        sanitizePdfText((p ? p.name : '—') + '  ·  ' + (m ? m.name : 'Unassigned') + '  ·  due ' + t.due + '  ·  ' + t.priority),
        { x: MARGIN + 66, y: ctx.y, size: 8, font: ctx.font, color: ctx.colors.faint });
      ctx.y -= 24;
    });
  });
}

function pdfWorkload(ctx){
  ctx.header('Workload', 'ACTIVE HOURS VS WEEKLY CAPACITY');
  drawTable(ctx,
    ['Teammate', 'Role', 'Active hrs', 'Capacity', 'Utilization'],
    window.state.members.map(m => {
      const hrs = window.state.tasks.filter(t => t.assigneeId === m.id && t.status !== 'done').reduce((a, t) => a + t.hours, 0);
      const pct = Math.round((hrs / m.capacity) * 100);
      return [m.name, m.role, String(hrs) + 'h', String(m.capacity) + 'h', pct + '%'];
    }),
    [1.8, 2.2, 1, 1, 1]);
}

function pdfProjects(ctx){
  ctx.header('Projects', window.state.projects.length + ' ACTIVE');
  drawTable(ctx,
    ['Project', 'Accent', 'Done', 'Total', '% Complete'],
    window.state.projects.map(p => {
      const tasks = window.state.tasks.filter(t => t.projectId === p.id);
      const done = tasks.filter(t => t.status === 'done').length;
      return [p.name, p.color, String(done), String(tasks.length), tasks.length ? Math.round(done / tasks.length * 100) + '%' : '0%'];
    }),
    [2.4, 1.2, 0.8, 0.8, 1.2]);
}

function pdfTeam(ctx){
  ctx.header('Team', window.state.members.length + ' MEMBERS');
  drawTable(ctx,
    ['Name', 'Role', 'Weekly capacity'],
    window.state.members.map(m => [m.name, m.role, String(m.capacity) + 'h']),
    [1.6, 2.2, 1.2]);
}

function pdfBills(ctx){
  ctx.header('Bills & Invoices', window.state.bills.length + ' INVOICES');
  const totalBilled = window.state.bills.reduce((s, b) => s + window.calcBillTotal(b), 0);
  ctx.paragraph('Total billed: ' + window.formatCurrency(totalBilled));
  ctx.y -= 4;
  if(!window.state.bills.length){
    ctx.paragraph('No invoices yet.', 9.5, ctx.colors.faint);
    return;
  }
  window.state.bills.forEach(b => {
    const party = window.billPartyLabel ? window.billPartyLabel(b) : 'Unassigned';
    const sub = window.calcSubtotal(b.lineItems);
    const tax = window.isTaxExempt && window.isTaxExempt(b) ? 0 : window.calcTax(sub, b.taxRate);
    const total = window.calcBillTotal(b);
    ctx.sectionTitle(b.billNumber + ' — ' + party + '  ·  ' + b.status);
    ctx.paragraph('Period: ' + b.periodStart + ' → ' + b.periodEnd + '   |   Issued: ' + b.issueDate + '   |   Due: ' + b.dueDate, 8.5, ctx.colors.faint, 11);
    if(b.flags && b.flags.length){
      ctx.ensureSpace(18);
      let fx = MARGIN;
      const flagToColor = (f) => {
        const key = (f || '').toLowerCase();
        if(key==='urgent') return ctx.colors.flagUrgent;
        if(key==='reviewed') return ctx.colors.flagReviewed;
        if(key==='recurring') return ctx.colors.flagRecurring;
        if(key==='tax-exempt') return ctx.colors.flagTaxExempt;
        if(key==='final') return ctx.colors.flagFinal;
        return ctx.colors.dim;
      };
      for(const f of b.flags){
        const col = flagToColor(f);
        ctx.page.drawRectangle({ x: fx, y: ctx.y - 12, width: 10, height: 10, color: col });
        ctx.page.drawText(sanitizePdfText((f || '').charAt(0).toUpperCase() + (f || '').slice(1)), { x: fx + 14, y: ctx.y - 2, size: 9, font: ctx.font, color: ctx.colors.faint });
        fx += 84;
      }
      ctx.y -= 18;
    }
    drawTable(ctx,
      ['Description', 'Hours', 'Rate', 'Amount'],
      b.lineItems.map(li => [li.description, String(li.hours), window.formatCurrency(li.rate) + '/hr', window.formatCurrency(li.hours * li.rate)]),
      [2.4, 0.7, 0.9, 1]);
    ctx.paragraph('Subtotal: ' + window.formatCurrency(sub) + '   |   Tax (' + (window.isTaxExempt && window.isTaxExempt(b) ? 'exempt' : b.taxRate + '%') + '): ' + window.formatCurrency(tax) + '   |   Total: ' + window.formatCurrency(total), 9, ctx.colors.dark);
    if(b.notes) ctx.paragraph('Notes: ' + b.notes, 8.5, ctx.colors.faint, 11);
    ctx.y -= 8;
  });
}

function pdfAgreements(ctx){
  ctx.header('Agreements', 'VERBAL DEALS & BILLING TERMS');
  if(!window.state.agreements.length){
    ctx.paragraph('No agreements logged yet.', 9.5, ctx.colors.faint);
    return;
  }
  window.state.agreements.forEach(a => {
    ctx.ensureSpace(60);
    ctx.sectionTitle(a.title);
    ctx.paragraph(
      (a.party || '') + (a.amount ? '  ·  ' + a.amount : '') + '  ·  ' + a.status + '  ·  agreed ' + a.dateAgreed,
      8.5, ctx.colors.faint, 11);
    ctx.paragraph(a.terms || '', 9.5, ctx.colors.body);
    ctx.y -= 6;
  });
}
