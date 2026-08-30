function renderBills(){
  const view = document.getElementById('view');
  const memberOptions = window.state.members.map(m=>`<option value="${m.id}">${m.name}</option>`).join('');

  const totalBilled = window.state.bills.reduce((s,b)=> s + window.calcBillTotal(b), 0);
  const outstanding = window.state.bills.filter(b=>b.status==='sent' || b.status==='overdue').reduce((s,b)=> s + window.calcBillTotal(b), 0);
  const paidAmount = window.state.bills.filter(b=>b.status==='paid').reduce((s,b)=> s + window.calcBillTotal(b), 0);
  const overdueAmt = window.state.bills.filter(b=>b.status==='overdue').reduce((s,b)=> s + window.calcBillTotal(b), 0);

  view.innerHTML = `
    <div class="view-head">
      <div>
        <div class="view-title">Bills &amp; Invoices</div>
        <div class="view-sub">${window.state.bills.length} INVOICES · ${window.formatCurrency(totalBilled)} TOTAL</div>
      </div>
      <div class="view-actions">
        <select class="filter" id="billFilterStatus">
          <option value="">All status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
        <select class="filter" id="billFilterMember"><option value="">All members</option>${memberOptions}</select>
        <button class="btn btn-primary" id="addBillBtn">+ New invoice</button>
      </div>
    </div>
    <div class="bill-summary">
      <div class="bill-stat"><div class="bill-stat-label">Total Billed</div><div class="bill-stat-value amber">${window.formatCurrency(totalBilled)}</div></div>
      <div class="bill-stat"><div class="bill-stat-label">Outstanding</div><div class="bill-stat-value danger">${window.formatCurrency(outstanding)}</div></div>
      <div class="bill-stat"><div class="bill-stat-label">Paid</div><div class="bill-stat-value success">${window.formatCurrency(paidAmount)}</div></div>
      <div class="bill-stat"><div class="bill-stat-label">Overdue</div><div class="bill-stat-value danger">${window.formatCurrency(overdueAmt)}</div></div>
    </div>
    <div class="bill-list" id="billList"></div>
    <div id="billEmpty" class="bill-empty" style="${window.state.bills.length?'display:none':'display:block'}">No invoices yet — create one to start tracking billable work.</div>
  `;

  function _safeOpen(name, evtName, arg){
    if(typeof window[name] === 'function'){ try{ if(arg!==undefined) window[name](arg); else window[name](); }catch(e){ console.error(e); }}
    else { window.dispatchEvent(new CustomEvent(evtName, { detail: arg })); }
  }
  document.getElementById('addBillBtn').addEventListener('click', ()=>_safeOpen('openBillModal','open-bill-modal'));
  document.getElementById('billFilterStatus').addEventListener('change', drawBills);
  document.getElementById('billFilterMember').addEventListener('change', drawBills);
  drawBills();

  function drawBills(){
    const fs = document.getElementById('billFilterStatus').value;
    const fm = document.getElementById('billFilterMember').value;
    const filtered = window.state.bills.filter(b => (!fs || b.status===fs) && (!fm || b.memberId===fm));
    const list = document.getElementById('billList');
    const empty = document.getElementById('billEmpty');
    if(list){
      list.innerHTML = filtered.map(b => billCardHTML(b)).join('');
      empty.style.display = filtered.length ? 'none' : 'block';
    }
    document.querySelectorAll('[data-bill-toggle]').forEach(el=>{
      el.addEventListener('click', function(){
        const card = this.closest('.invoice-card');
        card.classList.toggle('expanded');
      });
    });
    document.querySelectorAll('[data-bill-edit]').forEach(btn=>{
      btn.addEventListener('click', e=>{ e.stopPropagation(); _safeOpen('openBillModal','open-bill-modal', window.state.bills.find(b=>b.id===btn.dataset.billEdit)); });
    });
    document.querySelectorAll('[data-bill-del]').forEach(btn=>{
      btn.addEventListener('click', e=>{
        e.stopPropagation();
        const b = window.state.bills.find(x=>x.id===btn.dataset.billDel);
        if(!b || !window.confirm(`Delete ${b.billNumber}?`)) return;
        window.state.bills = window.state.bills.filter(x=>x.id!==b.id);
        DB.remove('bills', 'id', b.id);
        window.renderNav(); window.renderTicker(); renderBills();
        window.toast('Invoice deleted');
      });
    });
    document.querySelectorAll('[data-bill-status]').forEach(btn=>{
      btn.addEventListener('click', e=>{
        e.stopPropagation();
        const b = window.state.bills.find(x=>x.id===btn.dataset.billStatus);
        if(!b) return;
        const next = {draft:'sent', sent:'paid', paid:'paid', overdue:'paid'}[b.status] || 'paid';
        b.status = next;
        DB.update('bills', { status: b.status }, 'id', b.id);
        window.renderNav(); window.renderTicker(); drawBills();
        window.toast(`Invoice marked as ${next}`);
      });
    });
  }

  function billCardHTML(b){
    const items = Array.isArray(b.lineItems) ? b.lineItems : [];
    const sub = window.calcSubtotal(items);
    const tax = window.isTaxExempt && window.isTaxExempt(b) ? 0 : window.calcTax(sub, b.taxRate);
    const total = sub + tax;
    const overdue = b.status==='sent' && b.dueDate && new Date(b.dueDate) < window.todayUTC();
    const effectiveStatus = overdue ? 'overdue' : b.status;
    if(overdue && b.status!=='overdue'){ b.status='overdue'; DB.update('bills', { status:'overdue' }, 'id', b.id); }
    const statusCls = window.billStatusClass(effectiveStatus);
    const party = window.billPartyLabel ? window.billPartyLabel(b) : (window.billMember(b) ? window.billMember(b).name : 'Unassigned');
    const worker = window.billMember(b);

    return `
      <div class="invoice-card ${b._expanded?'expanded':''}">
        <div class="invoice-head" data-bill-toggle>
          <div class="invoice-head-left">
            <span class="invoice-num">${b.billNumber}</span>
            <span class="invoice-member">${window.escapeHTML(party)}</span>
            ${worker && (b.party || '').trim() ? `<span class="invoice-member" style="opacity:.7">via ${window.escapeHTML(worker.name)}</span>` : ''}
            ${b.flags && b.flags.length ? `<span class="invoice-flags">${b.flags.map(f=>`<span class="flag-pill ${f}">${window.escapeHTML((f||'').charAt(0).toUpperCase()+ (f||'').slice(1))}</span>`).join('')}</span>` : ''}
            <span class="status-pill ${statusCls}">${effectiveStatus}</span>
          </div>
          <div class="invoice-head-right">
            <span class="invoice-total">${window.formatCurrency(total)}</span>
            <span style="color:var(--text-faint);font-size:12px;">▼</span>
          </div>
        </div>
        <div class="invoice-body">
          <div class="invoice-period">Period: ${window.fmtDate(b.periodStart)} — ${window.fmtDate(b.periodEnd)}</div>

          <table class="invoice-table">
            <thead><tr><th>Description</th><th>Hours</th><th>Rate</th><th>Amount</th></tr></thead>
            <tbody>
              ${(items).map(li => `
                <tr>
                  <td>${window.escapeHTML(li.description)}</td>
                  <td>${li.hours}</td>
                  <td>${window.formatCurrency(li.rate)}/hr</td>
                  <td class="amt">${window.formatCurrency(li.hours * li.rate)}</td>
                </tr>`).join('')}
            </tbody>
          </table>

          <div class="invoice-totals">
            <div><span>Subtotal</span><span>${window.formatCurrency(sub)}</span></div>
            <div><span>Tax (${window.isTaxExempt && window.isTaxExempt(b) ? 'exempt' : (b.taxRate + '%')})</span><span>${window.formatCurrency(tax)}</span></div>
            <div class="grand-total"><span>Total</span><span>${window.formatCurrency(total)}</span></div>
          </div>

          ${b.notes ? `<div class="invoice-notes">${window.escapeHTML(b.notes)}</div>` : ''}

          <div class="invoice-dates">
            <span>Issued: ${window.fmtDate(b.issueDate)}</span>
            <span>Due: ${window.fmtDate(b.dueDate)}</span>
          </div>

          <div class="invoice-actions">
            <button class="btn btn-sm" data-bill-edit="${b.id}">✎ Edit</button>
            <button class="btn btn-sm btn-primary" data-bill-status="${b.id}">${effectiveStatus==='draft'?'Mark sent':effectiveStatus==='sent'?'Mark paid':effectiveStatus==='overdue'?'Mark paid':'Paid ✓'}</button>
            <button class="btn btn-sm btn-ghost" data-bill-del="${b.id}">✕ Delete</button>
          </div>
        </div>
      </div>`;
  }
}
window.renderBills = renderBills;
