export function member(id){ return window.state.members.find(m=>m.id===id); }
export function project(id){ return window.state.projects.find(p=>p.id===id); }
export function initials(name){ return name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(); }
export function todayUTC(){ const n = new Date(); return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate())); }
export function todayStr(){ return todayUTC().toISOString().slice(0,10); }
export function addDaysStr(days){ const d = todayUTC(); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0,10); }
export function monthEndStr(){ const n = new Date(); const end = new Date(Date.UTC(n.getFullYear(), n.getMonth() + 1, 0)); return end.toISOString().slice(0,10); }
export function isOverdue(task){ return task.status!=='done' && new Date(task.due) < todayUTC(); }
export function fmtDate(d){ const dt=new Date(d); return dt.toLocaleDateString('en-US',{month:'short', day:'numeric'}); }

export function formatCurrency(n){ return '₹' + Number(n).toLocaleString('en-IN', {minimumFractionDigits:0, maximumFractionDigits:0}); }
export function calcSubtotal(items){ return items.reduce((s,i)=> s + (i.hours * i.rate), 0); }
export function calcTax(subtotal, rate){ return Math.round(subtotal * (rate/100)); }
export function calcBillTotal(bill){ const sub = calcSubtotal(bill.lineItems); return sub + calcTax(sub, bill.taxRate); }
export function nextBillNumber(){ window.state.billSeq++; return 'INV-' + String(window.state.billSeq).padStart(3,'0'); }
export function billMember(bill){ return member(bill.memberId); }
export function billStatusClass(s){ return s==='paid'?'success':s==='overdue'?'danger':s==='sent'?'amber':s==='draft'?'':'teal'; }

export function toast(msg){ const t=document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(window._toastTimer); window._toastTimer = setTimeout(()=>t.classList.remove('show'), 3200); }
export function nextTaskId(){ window.state.taskSeq++; return 'TSK-' + String(window.state.taskSeq).padStart(3,'0'); }
