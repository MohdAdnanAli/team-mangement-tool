function member(id){ return window.state.members.find(m=>m.id===id); }
function project(id){ return window.state.projects.find(p=>p.id===id); }
function initials(name){ return name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(); }
function escapeHTML(s){ const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function todayUTC(){ const n = new Date(); return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate())); }
function todayStr(){ return todayUTC().toISOString().slice(0,10); }
function addDaysStr(days){ const d = todayUTC(); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0,10); }
function monthEndStr(){ const n = new Date(); const end = new Date(Date.UTC(n.getFullYear(), n.getMonth() + 1, 0)); return end.toISOString().slice(0,10); }
function isOverdue(task){ return task.status!=='done' && new Date(task.due) < todayUTC(); }
function fmtDate(d){ const dt=new Date(d); return dt.toLocaleDateString('en-US',{month:'short', day:'numeric'}); }

function formatCurrency(n){ return '₹' + Number(n).toLocaleString('en-IN', {minimumFractionDigits:0, maximumFractionDigits:0}); }
function billFlags(bill){
  const raw = bill && bill.flags;
  if(Array.isArray(raw)) return raw;
  if(typeof raw === 'string' && raw.trim()){
    try{ const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed : []; }catch(_e){ return []; }
  }
  return [];
}
function isTaxExempt(bill){ return billFlags(bill).map(f=>String(f).toLowerCase()).includes('tax-exempt'); }
function calcSubtotal(items){ return (items || []).reduce((s,i)=> s + ((Number(i.hours)||0) * (Number(i.rate)||0)), 0); }
function calcTax(subtotal, rate){ return Math.round(subtotal * ((Number(rate)||0)/100)); }
function calcBillTotal(bill){
  const sub = calcSubtotal(bill && bill.lineItems);
  const tax = isTaxExempt(bill) ? 0 : calcTax(sub, bill && bill.taxRate);
  return sub + tax;
}
function nextBillNumber(){ window.state.billSeq++; return 'INV-' + String(window.state.billSeq).padStart(3,'0'); }
function billMember(bill){ return member(bill && bill.memberId); }
function billPartyLabel(bill){
  const party = String(bill && bill.party || '').trim();
  if(party) return party;
  const m = billMember(bill);
  return m ? m.name + ' (payout)' : 'Unassigned';
}
function billStatusClass(s){ return s==='paid'?'success':s==='overdue'?'danger':s==='sent'?'amber':s==='draft'?'':'teal'; }

function toast(msg){ const t=document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(window._toastTimer); window._toastTimer = setTimeout(()=>t.classList.remove('show'), 3200); }
function nextTaskId(){ window.state.taskSeq++; return 'TSK-' + String(window.state.taskSeq).padStart(3,'0'); }
Object.assign(window,{member,project,initials,escapeHTML,todayUTC,todayStr,addDaysStr,monthEndStr,isOverdue,fmtDate,formatCurrency,billFlags,isTaxExempt,calcSubtotal,calcTax,calcBillTotal,nextBillNumber,billMember,billPartyLabel,billStatusClass,toast,nextTaskId});
