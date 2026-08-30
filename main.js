
/* ============================= MOBILE DRAWER ============================= */
const sidebarEl = document.getElementById('sidebarEl');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');
function openSidebar(){ sidebarEl.classList.add('open'); sidebarBackdrop.classList.add('open'); }
function closeSidebar(){ sidebarEl.classList.remove('open'); sidebarBackdrop.classList.remove('open'); }
document.getElementById('hamburgerBtn').addEventListener('click', openSidebar);
sidebarBackdrop.addEventListener('click', closeSidebar);

/* ============================= THEME ============================= */
let themePref = 'light'; // 'light' | 'dark' | 'system'
const systemMedia = window.matchMedia('(prefers-color-scheme: light)');

function applyTheme(){
  const resolved = themePref === 'system' ? (systemMedia.matches ? 'light' : 'dark') : themePref;
  if(resolved === 'light') document.documentElement.setAttribute('data-theme', 'light');
  else document.documentElement.removeAttribute('data-theme');
  document.querySelectorAll('.theme-btn').forEach(b=>{
    b.classList.toggle('active', b.dataset.themeOpt === themePref);
  });
}
document.getElementById('themeToggle').addEventListener('click', e=>{
  const btn = e.target.closest('[data-theme-opt]');
  if(!btn) return;
  themePref = btn.dataset.themeOpt;
  applyTheme();
});
systemMedia.addEventListener('change', ()=>{ if(themePref === 'system') applyTheme(); });
applyTheme();

/* ============================= STATE ============================= */
const uid = (p) => p + '-' + Math.random().toString(36).slice(2,7);

const DEFAULT_MEMBER_AVATARS = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80',
  'https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=240&q=80',
];

function normalizeMemberAvatar(value, fallbackName=''){
  const trimmed = String(value || '').trim();
  if(trimmed){
    try{
      const parsed = new URL(trimmed);
      if(['http:','https:','data:'].includes(parsed.protocol)) return trimmed;
    }catch(_e){}
  }
  if(!fallbackName) return DEFAULT_MEMBER_AVATARS[0];
  let hash = 0;
  for(let i=0; i<fallbackName.length; i++) hash = (hash * 31 + fallbackName.charCodeAt(i)) >>> 0;
  return DEFAULT_MEMBER_AVATARS[hash % DEFAULT_MEMBER_AVATARS.length];
}

const state = {
  view: 'dashboard',
  taskSeq: 13,
  members: [
    {id:'mem-1', name:'Abhijeet', role:'Low-Level Design', capacity:38, avatar: normalizeMemberAvatar('', 'Abhijeet')},
    {id:'mem-2', name:'Pandey Ji', role:'Model and protype', capacity:35, avatar: normalizeMemberAvatar('', 'Pandey Ji')},
    {id:'mem-3', name:'Ashutosh Ji', role:'High-Level Design', capacity:32, avatar: normalizeMemberAvatar('', 'Ashutosh Ji')},
    {id:'mem-4', name:'Jaiswal', role:'Veriification team', capacity:30, avatar: normalizeMemberAvatar('', 'Jaiswal')},
  ],
  projects: [
    {id:'proj-1', name:'Dashboard', color:'#4FD1C5'},
    {id:'proj-2', name:'Profile', color:'#F2B84B'},
    {id:'proj-3', name:'Sub IsOrNot', color:'#8AA4FF'},
    {id:'proj-4', name:'Bill life Cycle', color:'#E8656A'},
    {id:'proj-5', name:'otp and mail services', color:'#5FBF7A'},
    {id:'proj-6', name:'Entity Relation and clean design', color:'#C792EA'},
  ],
  tasks: [
    {id:'TSK-001', title:'Ship new pricing page hero', projectId:'proj-1', assigneeId:'mem-1', status:'progress', priority:'high', due:'2026-08-02', hours:8},
    {id:'TSK-002', title:'Wire up billing webhook retries', projectId:'proj-1', assigneeId:'mem-2', status:'todo', priority:'high', due:'2026-08-05', hours:12},
    {id:'TSK-003', title:'Redesign onboarding checklist UI', projectId:'proj-2', assigneeId:'mem-3', status:'review', priority:'med', due:'2026-08-01', hours:6},
    {id:'TSK-004', title:'Write regression suite for auth', projectId:'proj-3', assigneeId:'mem-4', status:'progress', priority:'med', due:'2026-08-08', hours:10},
    {id:'TSK-005', title:'Fix Safari flex bug on dashboard', projectId:'proj-1', assigneeId:'mem-1', status:'done', priority:'low', due:'2026-07-22', hours:3},
    {id:'TSK-006', title:'Customer migration runbook', projectId:'proj-2', assigneeId:'mem-2', status:'todo', priority:'med', due:'2026-08-10', hours:5},
    {id:'TSK-007', title:'Internal CLI: add dry-run flag', projectId:'proj-3', assigneeId:'mem-2', status:'done', priority:'low', due:'2026-07-20', hours:4},
    {id:'TSK-008', title:'Design system: audit spacing tokens', projectId:'proj-3', assigneeId:'mem-3', status:'todo', priority:'low', due:'2026-08-14', hours:7},
    {id:'TSK-010', title:'Entity 101', projectId:'proj-6', assigneeId:'mem-1', status:'todo', priority:'low', due:'2026-10-05', hours:6},
    {id:'TSK-011', title:'services 101', projectId:'proj-4', assigneeId:'mem-2', status:'progress', priority:'med', due:'2026-10-05', hours:8},
    {id:'TSK-012', title:'system 101', projectId:'proj-2', assigneeId:'mem-3', status:'review', priority:'low', due:'2026-10-05', hours:5},
    {id:'TSK-013', title:'Verification to the end', projectId:'proj-3', assigneeId:'mem-4', status:'done', priority:'med', due:'2026-10-05', hours:7},
  ],
  billSeq: 0,
  bills: [
    {
      id:'bill-1',
      memberId:'mem-1',
      flags:['urgent','reviewed'],
      billNumber:'INV-001',
      periodStart:'2026-07-01',
      periodEnd:'2026-07-31',
      lineItems:[
        { description:'Dashboard UI development', hours:24, rate:2500 },
        { description:'Sprint planning & code review', hours:8, rate:2500 },
      ],
      taxRate:18,
      issueDate:'2026-08-01',
      dueDate:'2026-08-15',
      status:'sent',
      notes:'Payment via NEFT within 15 days of invoice date. Late payment attracts 2% interest per month.',
    },
    {
      id:'bill-2',
      memberId:'mem-3',
      flags:['recurring'],
      billNumber:'INV-002',
      periodStart:'2026-07-01',
      periodEnd:'2026-07-31',
      lineItems:[
        { description:'High-level architecture review', hours:10, rate:3000 },
        { description:'Technical documentation', hours:6, rate:2500 },
      ],
      taxRate:18,
      issueDate:'2026-08-02',
      dueDate:'2026-08-16',
      status:'draft',
      notes:'Draft — pending approval from the client.',
    },
  ],
  agreements: [
    {
      id: uid('agr'),
      title: 'Aurora Corp — Retainer terms',
      party: 'Aurora Corp (client)',
      amount: '₹1,20,000 / month',
      status: 'active',
      dateAgreed: '2026-06-01',
      terms: 'Verbally agreed on the July 14 call: monthly retainer covers up to 40 hrs of dev work. Anything beyond is billed at ₹2,500/hr, invoiced separately. Retainer ends the month after either side gives written notice — no lock-in period.',
    },
    {
      id: uid('agr'),
      title: 'Karan — overtime comp',
      party: 'Karan Mehta (internal)',
      amount: '1.5x day rate',
      status: 'settled',
      dateAgreed: '2026-05-10',
      terms: 'Agreed verbally during the QA crunch: any weekend testing gets 1.5x day rate, paid out with the next cycle. Already settled for the May sprint — no balance owed.',
    },
  ],
};

// Ensure seeded in-memory tasks have a `meta` field so UI code can safely parse it
state.tasks.forEach(t=>{
  if(t.meta === undefined){
    t.meta = JSON.stringify({ description: '', labels: [], checklist: [], attachments: [], activity: [] });
  }
});

const STATUS_COLS = [
  {key:'todo', label:'To Do'},
  {key:'progress', label:'In Progress'},
  {key:'review', label:'Review'},
  {key:'done', label:'Done'},
];

window.charts = {};

// Expose shared runtime objects for lazy-loaded modules
window.state = state;
window.STATUS_COLS = STATUS_COLS;

/* Shared helpers, renderers, and reputation tools are loaded as classic scripts
 * in index.html so opening this app directly from disk also works. */
initModalBackdrop();

/* ============================= NAV ============================= */
const NAV = [
  {key:'dashboard', icon:'◈', label:'Dashboard'},
  {key:'kanban', icon:'▤', label:'Kanban'},
  {key:'workload', icon:'▮', label:'Workload'},
  {key:'projects', icon:'◫', label:'Projects'},
  {key:'team', icon:'◍', label:'Team'},
  {key:'oneonones', icon:'◎', label:'Check-ins'},
  {key:'bills', icon:'💰', label:'Bills'},
  {key:'agreements', icon:'✎', label:'Agreements'},
];

function renderNav(){
  const nav = document.getElementById('navList');
  nav.innerHTML = NAV.map(n=>{
    let count = '';
    if(n.key==='kanban') count = state.tasks.length;
    if(n.key==='team') count = state.members.length;
    if(n.key==='oneonones') count = (state.oneOnOnes || []).length;
    if(n.key==='projects') count = state.projects.length;
    if(n.key==='bills') count = state.bills.length;
    if(n.key==='agreements') count = state.agreements.length;
    return `<button class="nav-item ${state.view===n.key?'active':''}" data-nav="${n.key}">
      <span class="nav-icon">${n.icon}</span>${n.label}
      ${count!==''?`<span class="nav-count">${count}</span>`:''}
    </button>`;
  }).join('');
  nav.querySelectorAll('[data-nav]').forEach(btn=>{
    btn.addEventListener('click', ()=>{ state.view = btn.dataset.nav; render(); closeSidebar(); });
  });
}

/* ============================= TICKER ============================= */
function renderTicker(){
  const total = state.tasks.length;
  const inProgress = state.tasks.filter(t=>t.status==='progress').length;
  const overdue = state.tasks.filter(isOverdue).length;
  const doneCount = state.tasks.filter(t=>t.status==='done').length;
  const totalBilled = state.bills.reduce((s,b)=> s + calcBillTotal(b), 0);
  const paidBilled = state.bills.filter(b=>b.status==='paid').reduce((s,b)=> s + calcBillTotal(b), 0);
  const cells = [
    {label:'Active tasks', value: total - doneCount, cls:''},
    {label:'In progress', value: inProgress, cls:'amber'},
    {label:'Overdue tasks', value: overdue, cls:'danger'},
    {label:'Completed', value: doneCount, cls:'success'},
    {label:'Billed', value: '₹' + Math.round(totalBilled/1000) + 'k', cls:'amber'},
    {label:'Paid', value: '₹' + Math.round(paidBilled/1000) + 'k', cls:'teal'},
  ];
  document.getElementById('ticker').innerHTML = cells.map(c=>`
    <div class="ticker-cell">
      <div class="ticker-label">${c.label}</div>
      <div class="ticker-value ${c.cls}">${String(c.value).padStart(2,'0')}</div>
    </div>`).join('');
}

/* ============================= DASHBOARD ============================= */
/* Dashboard renderer moved to modules/renderers/dashboard.js */

/* ============================= KANBAN ============================= */
/* Kanban renderer moved to modules/renderers/kanban.js */

/* Projects renderer moved to modules/renderers/projects.js */

/* ============================= TEAM ============================= */
function legacyRenderTeam(){
  const view = document.getElementById('view');
  view.innerHTML = `
    <div class="view-head">
      <div><div class="view-title">Team</div><div class="view-sub">${state.members.length} MEMBERS</div></div>
      <div class="view-actions"><button class="btn btn-primary" id="addMemberBtn">+ Add teammate</button></div>
    </div>
    <div class="team-grid">
      ${state.members.map(m=>`
        <div class="member-card">
          <div class="member-avatar ${m.avatar ? 'has-image' : ''}">
            ${m.avatar ? `<img src="${escapeHTML(m.avatar)}" alt="${escapeHTML(m.name)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><span class="member-fallback" style="display:none;">${initials(m.name)}</span>` : `<span class="member-fallback">${initials(m.name)}</span>`}
          </div>
          <div class="member-body">
            <div class="card-top-row">
              <div class="member-name">${escapeHTML(m.name)}</div>
              <div class="card-actions">
                <button class="icon-btn" data-edit-mem="${m.id}" title="Edit">✎</button>
                <button class="icon-btn" data-del-mem="${m.id}" title="Delete">✕</button>
              </div>
            </div>
            <div class="member-role">${escapeHTML(m.role)}</div>
            <div class="member-cap">${m.capacity}h/week capacity</div>
          </div>
        </div>`).join('') || '<div class="empty">No teammates yet</div>'}
    </div>
  `;
  document.getElementById('addMemberBtn').addEventListener('click', ()=>openMemberModal());
  document.querySelectorAll('[data-edit-mem]').forEach(btn=>{
    btn.addEventListener('click', ()=> openMemberModal(member(btn.dataset.editMem)));
  });
  document.querySelectorAll('[data-del-mem]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const m = member(btn.dataset.delMem);
      if(!m) return;
      const linked = state.tasks.filter(t=>t.assigneeId===m.id).length;
      const msg = linked ? `Remove ${m.name}? ${linked} ticket(s) will become unassigned.` : `Remove ${m.name}?`;
      if(!window.confirm(msg)) return;
      state.tasks.forEach(t=>{ if(t.assigneeId===m.id){ t.assigneeId=''; DB.update('tasks', { assigneeId:'' }, 'id', t.id); } });
      state.members = state.members.filter(x=>x.id!==m.id);
      DB.remove('members', 'id', m.id);
      renderNav(); renderTicker(); window.renderTeam();
      toast('Teammate removed');
    });
  });
}

/* ============================= BILLS ============================= */
function legacyRenderBills(){
  const view = document.getElementById('view');
  const memberOptions = state.members.map(m=>`<option value="${m.id}">${m.name}</option>`).join('');

  const totalBilled = state.bills.reduce((s,b)=> s + calcBillTotal(b), 0);
  const outstanding = state.bills.filter(b=>b.status==='sent' || b.status==='overdue').reduce((s,b)=> s + calcBillTotal(b), 0);
  const paidAmount = state.bills.filter(b=>b.status==='paid').reduce((s,b)=> s + calcBillTotal(b), 0);
  const overdueAmt = state.bills.filter(b=>b.status==='overdue').reduce((s,b)=> s + calcBillTotal(b), 0);

  view.innerHTML = `
    <div class="view-head">
      <div>
        <div class="view-title">Bills &amp; Invoices</div>
        <div class="view-sub">${state.bills.length} INVOICES · ${formatCurrency(totalBilled)} TOTAL</div>
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
      <div class="bill-stat"><div class="bill-stat-label">Total Billed</div><div class="bill-stat-value amber">${formatCurrency(totalBilled)}</div></div>
      <div class="bill-stat"><div class="bill-stat-label">Outstanding</div><div class="bill-stat-value danger">${formatCurrency(outstanding)}</div></div>
      <div class="bill-stat"><div class="bill-stat-label">Paid</div><div class="bill-stat-value success">${formatCurrency(paidAmount)}</div></div>
      <div class="bill-stat"><div class="bill-stat-label">Overdue</div><div class="bill-stat-value danger">${formatCurrency(overdueAmt)}</div></div>
    </div>
    <div class="bill-list" id="billList"></div>
    <div id="billEmpty" class="bill-empty" style="${state.bills.length?'display:none':'display:block'}">No invoices yet — create one to start tracking billable work.</div>
  `;

  document.getElementById('addBillBtn').addEventListener('click', ()=>openBillModal());
  document.getElementById('billFilterStatus').addEventListener('change', drawBills);
  document.getElementById('billFilterMember').addEventListener('change', drawBills);
  drawBills();

  /* Bills renderer moved to modules/renderers/bills.js */
}


function billCardHTML(b){
  const m = billMember(b);
  const sub = calcSubtotal(b.lineItems);
  const tax = calcTax(sub, b.taxRate);
  const total = sub + tax;
  const overdue = b.status==='sent' && new Date(b.dueDate) < todayUTC();
  const effectiveStatus = overdue ? 'overdue' : b.status;
  if(overdue && b.status!=='overdue'){ b.status='overdue'; DB.update('bills', { status:'overdue' }, 'id', b.id); }
  const statusCls = billStatusClass(effectiveStatus);

  return `
    <div class="invoice-card ${b._expanded?'expanded':''}">
      <div class="invoice-head" data-bill-toggle>
        <div class="invoice-head-left">
          <span class="invoice-num">${b.billNumber}</span>
          <span class="invoice-member">${m ? escapeHTML(m.name) : 'Unassigned'}</span>
          ${b.flags && b.flags.length ? `<span class="invoice-flags">${b.flags.map(f=>`<span class="flag-pill ${f}">${escapeHTML(f.charAt(0).toUpperCase()+f.slice(1))}</span>`).join('')}</span>` : ''}
          <span class="status-pill ${statusCls}">${effectiveStatus}</span>
        </div>
        <div class="invoice-head-right">
          <span class="invoice-total">${formatCurrency(total)}</span>
          <span style="color:var(--text-faint);font-size:12px;">▼</span>
        </div>
      </div>
      <div class="invoice-body">
        <div class="invoice-period">Period: ${fmtDate(b.periodStart)} — ${fmtDate(b.periodEnd)}</div>

        <table class="invoice-table">
          <thead><tr><th>Description</th><th>Hours</th><th>Rate</th><th>Amount</th></tr></thead>
          <tbody>
            ${b.lineItems.map(li => `
              <tr>
                <td>${escapeHTML(li.description)}</td>
                <td>${li.hours}</td>
                <td>${formatCurrency(li.rate)}/hr</td>
                <td class="amt">${formatCurrency(li.hours * li.rate)}</td>
              </tr>`).join('')}
          </tbody>
        </table>

        <div class="invoice-totals">
          <div><span>Subtotal</span><span>${formatCurrency(sub)}</span></div>
          <div><span>Tax (${b.taxRate}%)</span><span>${formatCurrency(tax)}</span></div>
          <div class="grand-total"><span>Total</span><span>${formatCurrency(total)}</span></div>
        </div>

        ${b.notes ? `<div class="invoice-notes">${escapeHTML(b.notes)}</div>` : ''}

        <div class="invoice-dates">
          <span>Issued: ${fmtDate(b.issueDate)}</span>
          <span>Due: ${fmtDate(b.dueDate)}</span>
        </div>

        <div class="invoice-actions">
          <button class="btn btn-sm" data-bill-edit="${b.id}">✎ Edit</button>
          <button class="btn btn-sm btn-primary" data-bill-status="${b.id}">${effectiveStatus==='draft'?'Mark sent':effectiveStatus==='sent'?'Mark paid':effectiveStatus==='overdue'?'Mark paid':'Paid ✓'}</button>
          <button class="btn btn-sm btn-ghost" data-bill-del="${b.id}">✕ Delete</button>
        </div>
      </div>
    </div>`;
}

function openBillModal(existing){
  const memberOptions = state.members.map(m=>`<option value="${m.id}" ${existing && existing.memberId===m.id?'selected':''}>${m.name}</option>`).join('');
  const statusOptions = ['draft','sent','paid','overdue'].map(s=>`<option value="${s}" ${existing && existing.status===s?'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('');

  const lineItemsHTML = existing ? existing.lineItems.map((li,i)=>`
    <div class="line-item-row" data-li="${i}">
      <input class="li-desc" value="${escapeHTML(li.description)}" placeholder="Description">
      <input class="li-hrs" type="number" min="0" step="0.5" value="${li.hours}">
      <input class="li-rate" type="number" min="0" step="100" value="${li.rate}">
      <span class="amt" style="font-family:var(--font-mono);font-size:12px;color:var(--text-dim);text-align:right;">${formatCurrency(li.hours*li.rate)}</span>
      <button class="line-item-del" data-remove-li="${i}">×</button>
    </div>`) : `<div class="line-item-row" data-li="0">
      <input class="li-desc" placeholder="e.g. Development work">
      <input class="li-hrs" type="number" min="0" step="0.5" value="8">
      <input class="li-rate" type="number" min="0" step="100" value="2500">
      <span class="amt" style="font-family:var(--font-mono);font-size:12px;color:var(--text-dim);text-align:right;">₹20,000</span>
      <button class="line-item-del" data-remove-li="0">×</button>
    </div>`;

  openModal(`
    <div class="modal-title">${existing ? 'Edit invoice' : 'New invoice'}</div>
    <div class="field"><label>Bill to (client / company)</label><input id="fBillParty" placeholder="e.g. Aurora Corp" value="${existing ? escapeHTML(existing.party || '') : ''}"></div>
    <div class="field"><label>Work owner (team member, optional)</label><select id="fBillMember"><option value="">No internal owner</option>${memberOptions}</select></div>
    <div class="row2">
      <div class="field"><label>Period start</label><input id="fPeriodStart" type="date" value="${existing ? existing.periodStart : todayStr()}"></div>
      <div class="field"><label>Period end</label><input id="fPeriodEnd" type="date" value="${existing ? existing.periodEnd : monthEndStr()}"></div>
    </div>
    <div class="field">
      <label>Line items</label>
      <div id="lineItemsContainer">${lineItemsHTML}</div>
      <button class="btn btn-sm" id="addLineItemBtn" style="margin-top:6px;">+ Add line</button>
    </div>
    <div class="row2">
      <div class="field"><label>Tax rate (%)</label><input id="fTaxRate" type="number" min="0" step="1" value="${existing ? existing.taxRate : 18}"></div>
      <div class="field"><label>Status</label><select id="fBillStatus">${statusOptions}</select></div>
    </div>
    <div class="row2">
      <div class="field"><label>Issue date</label><input id="fIssueDate" type="date" value="${existing ? existing.issueDate : todayStr()}"></div>
      <div class="field"><label>Due date</label><input id="fDueDate" type="date" value="${existing ? existing.dueDate : addDaysStr(15)}"></div>
    </div>
    <div class="field">
      <label>Flags</label>
      <div class="color-swatches" id="flagOptions">
        ${['urgent','reviewed','recurring','tax-exempt','final'].map(f=>`<label class="color-swatch-opt ${existing && existing.flags && existing.flags.includes(f) ? 'selected':''}">
            <input type="checkbox" class="flag-checkbox" value="${f}" ${existing && existing.flags && existing.flags.includes(f) ? 'checked':''}>
            <span class="swatch-dot" style="background: ${f==='urgent'?'var(--danger)':f==='reviewed'?'var(--blue)':f==='recurring'?'var(--teal)':f==='tax-exempt'?'#9B6EE3':'var(--amber)'}"></span>
            <span class="swatch-hex">${f.charAt(0).toUpperCase()+f.slice(1).replace('-',' ')}</span>
          </label>`).join('')}
      </div>
    </div>
    <div class="field"><label>Notes / Payment terms</label><textarea id="fBillNotes" rows="3" placeholder="e.g. Payment via NEFT within 15 days...">${existing ? escapeHTML(existing.notes||'') : ''}</textarea></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" id="cancelBtn">Cancel</button>
      <button class="btn btn-primary" id="saveBillBtn">${existing ? 'Save changes' : 'Create invoice'}</button>
    </div>
  `);

  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  document.getElementById('addLineItemBtn').addEventListener('click', ()=>{
    const container = document.getElementById('lineItemsContainer');
    const idx = container.children.length;
    const row = document.createElement('div');
    row.className = 'line-item-row';
    row.dataset.li = idx;
    row.innerHTML = `
      <input class="li-desc" placeholder="Description">
      <input class="li-hrs" type="number" min="0" step="0.5" value="4">
      <input class="li-rate" type="number" min="0" step="100" value="2500">
      <span class="amt" style="font-family:var(--font-mono);font-size:12px;color:var(--text-dim);text-align:right;">₹10,000</span>
      <button class="line-item-del" data-remove-li="${idx}">×</button>`;
    container.appendChild(row);
    row.querySelector('.line-item-del').addEventListener('click', function(){ row.remove(); });
    row.querySelectorAll('.li-hrs, .li-rate').forEach(inp=>{
      inp.addEventListener('input', function(){
        const hrs = parseFloat(row.querySelector('.li-hrs').value) || 0;
        const rate = parseFloat(row.querySelector('.li-rate').value) || 0;
        row.querySelector('.amt').textContent = formatCurrency(hrs*rate);
      });
    });
  });

  document.querySelectorAll('.line-item-del').forEach(btn=>{
    btn.addEventListener('click', function(){
      const row = this.closest('.line-item-row');
      if(document.querySelectorAll('.line-item-row').length > 1) row.remove();
      else toast('Need at least one line item');
    });
  });

  document.querySelectorAll('.li-hrs, .li-rate').forEach(inp=>{
    inp.addEventListener('input', function(){
      const row = this.closest('.line-item-row');
      const hrs = parseFloat(row.querySelector('.li-hrs').value) || 0;
      const rate = parseFloat(row.querySelector('.li-rate').value) || 0;
      row.querySelector('.amt').textContent = formatCurrency(hrs*rate);
    });
  });

  document.getElementById('saveBillBtn').addEventListener('click', ()=>{
    const memberId = document.getElementById('fBillMember').value;
    const party = document.getElementById('fBillParty').value.trim();
    const periodStart = document.getElementById('fPeriodStart').value;
    const periodEnd = document.getElementById('fPeriodEnd').value;
    const taxRate = parseInt(document.getElementById('fTaxRate').value) || 0;
    const status = document.getElementById('fBillStatus').value;
    const issueDate = document.getElementById('fIssueDate').value;
    const dueDate = document.getElementById('fDueDate').value;
    const notes = document.getElementById('fBillNotes').value.trim();

    const items = [];
    document.querySelectorAll('.line-item-row').forEach(row=>{
      const desc = row.querySelector('.li-desc').value.trim();
      const hrs = parseFloat(row.querySelector('.li-hrs').value) || 0;
      const rate = parseFloat(row.querySelector('.li-rate').value) || 0;
      if(desc && hrs>0 && rate>0) items.push({ description:desc, hours:hrs, rate });
    });

    if(!party){ toast('Enter the client or company being billed'); return; }
    if(items.length===0){ toast('Add at least one line item'); return; }

    if(existing){
      existing.memberId = memberId;
      existing.party = party;
      existing.periodStart = periodStart;
      existing.periodEnd = periodEnd;
      existing.lineItems = items;
      existing.taxRate = taxRate;
      existing.status = status;
      existing.issueDate = issueDate;
      existing.dueDate = dueDate;
      existing.notes = notes;
      const flags = Array.from(document.querySelectorAll('.flag-checkbox:checked')).map(i=>i.value);
      existing.flags = flags;
      DB.update('bills', { memberId, party, periodStart, periodEnd, taxRate, status, issueDate, dueDate, notes }, 'id', existing.id);
      DB.update('bills', { flags: JSON.stringify(existing.flags) }, 'id', existing.id);
      DB.replaceLineItems(existing.id, items);
      toast('Invoice updated');
    } else {
      const bill = {
        id: uid('bill'),
        memberId,
        party,
        billNumber: nextBillNumber(),
        periodStart,
        periodEnd,
        lineItems: items,
        taxRate,
        status,
        issueDate,
        dueDate,
        notes,
        flags: Array.from(document.querySelectorAll('.flag-checkbox:checked')).map(i=>i.value),
      };
      state.bills.push(bill);
      DB.insert('bills', { id: bill.id, memberId, party, billNumber: bill.billNumber, periodStart, periodEnd, flags: JSON.stringify(bill.flags), taxRate, issueDate, dueDate, status, notes });
      DB.replaceLineItems(bill.id, items);
      DB.setMeta('billSeq', state.billSeq);
      toast('Invoice created');
    }
    closeModal(); renderNav(); renderTicker(); window.renderBills();
  });
}

/* ============================= AGREEMENTS ============================= */
/* Agreements renderer moved to modules/renderers/agreements.js */

function openAgreementModal(){
  openModal(`
    <div class="modal-title">Log an agreement</div>
    <div class="field"><label>Title</label><input id="aTitle" placeholder="e.g. Aurora Corp — Retainer terms"></div>
    <div class="field"><label>Who it's with</label><input id="aParty" placeholder="e.g. Aurora Corp (client), or a teammate's name"></div>
    <div class="row2">
      <div class="field"><label>Amount / rate (optional)</label><input id="aAmount" placeholder="e.g. ₹1,20,000/month"></div>
      <div class="field"><label>Status</label><select id="aStatus"><option value="active">Active</option><option value="settled">Settled</option><option value="disputed">Disputed</option></select></div>
    </div>
    <div class="field"><label>Date agreed</label><input id="aDate" type="date" value="${todayStr()}"></div>
    <div class="field"><label>Terms (write it exactly as agreed)</label><textarea id="aTerms" rows="5" placeholder="What was verbally agreed — scope, billing, when it ends, exceptions..."></textarea></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" id="cancelBtn">Cancel</button>
      <button class="btn btn-primary" id="saveAgrBtn">Save agreement</button>
    </div>
  `);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  document.getElementById('saveAgrBtn').addEventListener('click', ()=>{
    const title = document.getElementById('aTitle').value.trim();
    const terms = document.getElementById('aTerms').value.trim();
    if(!title || !terms){ toast('Add a title and the terms'); return; }
    const agr = {
      id: uid('agr'),
      title,
      party: document.getElementById('aParty').value.trim() || '—',
      amount: document.getElementById('aAmount').value.trim(),
      status: document.getElementById('aStatus').value,
      dateAgreed: document.getElementById('aDate').value || todayStr(),
      terms,
    };
    state.agreements.push(agr);
    DB.insert('agreements', agr);
    closeModal(); renderNav(); renderAgreements();
    toast('Agreement logged');
  });
}

/* ============================= MODALS (lazy-loaded) ============================= */
// `openModal` and `closeModal` are provided by modules/modals.js and loaded at startup.

function openTaskModal(){
  const projOptions = state.projects.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
  const memberOptions = state.members.map(m=>`<option value="${m.id}">${m.name}</option>`).join('');
  openModal(`
    <div class="modal-title">New ticket</div>
    <div class="field"><label>Title</label><input id="fTitle" placeholder="e.g. Fix export button alignment"></div>
    <div class="row2">
      <div class="field"><label>Project</label><select id="fProject">${projOptions}</select></div>
      <div class="field"><label>Assignee</label><select id="fMember">${memberOptions}</select></div>
    </div>
    <div class="row2">
      <div class="field"><label>Priority</label><select id="fPriority"><option value="low">Low</option><option value="med" selected>Medium</option><option value="high">High</option></select></div>
      <div class="field"><label>Estimate (hrs)</label><input id="fHours" type="number" min="1" value="4"></div>
    </div>
    <div class="field"><label>Due date</label><input id="fDue" type="date" value="${addDaysStr(7)}"></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" id="cancelBtn">Cancel</button>
      <button class="btn btn-primary" id="saveTaskBtn">Create ticket</button>
    </div>
  `);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  document.getElementById('saveTaskBtn').addEventListener('click', ()=>{
    const title = document.getElementById('fTitle').value.trim();
    if(!title){ toast('Give the ticket a title'); return; }
    const task = {
      id: nextTaskId(),
      title,
      projectId: document.getElementById('fProject').value,
      assigneeId: document.getElementById('fMember').value,
      status: 'todo',
      priority: document.getElementById('fPriority').value,
      due: document.getElementById('fDue').value || addDaysStr(7),
      hours: Number(document.getElementById('fHours').value) || 4,
        meta: JSON.stringify({ description: '', labels: [], checklist: [], attachments: [], activity: [] })
    };
    state.tasks.push(task);
    DB.insert('tasks', task);
    DB.setMeta('taskSeq', state.taskSeq);
    closeModal(); renderNav(); renderTicker(); render();
    toast('Ticket created');
  });
}

function openMemberModal(existing){
  const avatarValue = existing && existing.avatar ? existing.avatar : normalizeMemberAvatar('', existing ? existing.name : '');
  openModal(`
    <div class="modal-title">${existing ? 'Edit teammate' : 'Add teammate'}</div>
    <div class="field"><label>Name</label><input id="mName" placeholder="e.g. Rhea Kapoor" value="${existing ? escapeHTML(existing.name) : ''}"></div>
    <div class="field"><label>Role</label><input id="mRole" placeholder="e.g. Backend Engineer" value="${existing ? escapeHTML(existing.role) : ''}"></div>
    <div class="field"><label>Weekly capacity (hrs)</label><input id="mCap" type="number" min="1" value="${existing ? existing.capacity : 40}"></div>
    <div class="field"><label>Avatar URL</label><input id="mAvatar" type="url" placeholder="https://images.unsplash.com/..." value="${escapeHTML(avatarValue)}"></div>
    <div class="field">
      <label>Preview</label>
      <div class="avatar-preview">
        <img id="mAvatarPreview" src="${escapeHTML(avatarValue)}" alt="Member avatar preview" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <span class="avatar-preview-fallback" style="display:none;">${existing ? initials(existing.name) : 'A'}</span>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" id="cancelBtn">Cancel</button>
      <button class="btn btn-primary" id="saveMemberBtn">${existing ? 'Save changes' : 'Add teammate'}</button>
    </div>
  `);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  document.getElementById('mAvatar').addEventListener('input', ()=>{
    const img = document.getElementById('mAvatarPreview');
    const fallback = document.querySelector('.avatar-preview-fallback');
    const value = document.getElementById('mAvatar').value.trim();
    if(!value){
      img.src = normalizeMemberAvatar('', document.getElementById('mName').value.trim() || 'Teammate');
      img.style.display = 'block';
      if(fallback) fallback.style.display = 'none';
      return;
    }
    img.src = value;
    img.style.display = 'block';
    if(fallback) fallback.style.display = 'none';
  });
  document.getElementById('mName').addEventListener('input', ()=>{
    const img = document.getElementById('mAvatarPreview');
    const fallback = document.querySelector('.avatar-preview-fallback');
    const currentValue = document.getElementById('mAvatar').value.trim();
    if(!currentValue || currentValue === normalizeMemberAvatar('', existing ? existing.name : '')){
      const next = normalizeMemberAvatar('', document.getElementById('mName').value.trim() || 'Teammate');
      img.src = next;
      document.getElementById('mAvatar').value = next;
      img.style.display = 'block';
      if(fallback) fallback.style.display = 'none';
    }
  });
  document.getElementById('saveMemberBtn').addEventListener('click', ()=>{
    const name = document.getElementById('mName').value.trim();
    if(!name){ toast('Name is required'); return; }
    const role = document.getElementById('mRole').value.trim() || 'Contributor';
    const capacity = Number(document.getElementById('mCap').value) || 40;
    const avatar = normalizeMemberAvatar(document.getElementById('mAvatar').value, name);
    if(existing){
      existing.name = name; existing.role = role; existing.capacity = capacity; existing.avatar = avatar;
      DB.update('members', { name, role, capacity, avatar }, 'id', existing.id);
      toast('Teammate updated');
    } else {
      const mem = { id: uid('mem'), name, role, capacity, avatar };
      state.members.push(mem);
      DB.insert('members', mem);
      toast('Teammate added');
    }
    closeModal(); renderNav(); renderTicker(); window.renderTeam();
  });
}

function openProjectModal(existing){
  const palette = ['#4FD1C5','#F2B84B','#8AA4FF','#E8656A','#5FBF7A','#C792EA'];
  openModal(`
    <div class="modal-title">${existing ? 'Edit project' : 'New project'}</div>
    <div class="field"><label>Name</label><input id="pName" placeholder="e.g. Mobile Revamp" value="${existing ? escapeHTML(existing.name) : ''}"></div>
    <div class="field"><label>Accent color</label>
      <div class="color-swatches">${palette.map(c=>`
        <label class="color-swatch-opt ${existing && existing.color===c ? 'selected':''}">
          <input type="radio" name="pColor" value="${c}" ${existing && existing.color===c ? 'checked':''}>
          <span class="swatch-dot" style="background:${c}"></span>
          <span class="swatch-hex">${c}</span>
        </label>
      `).join('')}</div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" id="cancelBtn">Cancel</button>
      <button class="btn btn-primary" id="saveProjBtn">${existing ? 'Save changes' : 'Create project'}</button>
    </div>
  `);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  document.querySelectorAll('.color-swatch-opt').forEach(el=>{
    el.addEventListener('click', function(){
      document.querySelectorAll('.color-swatch-opt').forEach(o=>o.classList.remove('selected'));
      this.classList.add('selected');
    });
  });
  document.getElementById('saveProjBtn').addEventListener('click', ()=>{
    const name = document.getElementById('pName').value.trim();
    if(!name){ toast('Name is required'); return; }
    const color = document.querySelector('input[name="pColor"]:checked')?.value || '#4FD1C5';
    if(existing){
      existing.name = name; existing.color = color;
      DB.update('projects', { name, color }, 'id', existing.id);
      toast('Project updated');
    } else {
      const proj = { id: uid('proj'), name, color };
      state.projects.push(proj);
      DB.insert('projects', proj);
      toast('Project created');
    }
    closeModal(); renderNav(); renderTicker(); renderProjects();
  });
}

// Expose modal opener helpers globally so renderer modules can call them.
try{
  if(typeof openTaskModal === 'function') window.openTaskModal = openTaskModal; else console.warn('openTaskModal not defined');
  if(typeof openMemberModal === 'function') window.openMemberModal = openMemberModal; else console.warn('openMemberModal not defined');
  if(typeof openProjectModal === 'function') window.openProjectModal = openProjectModal; else console.warn('openProjectModal not defined');
  if(typeof openBillModal === 'function') window.openBillModal = openBillModal; else console.warn('openBillModal not defined');
  if(typeof openAgreementModal === 'function') window.openAgreementModal = openAgreementModal; else console.warn('openAgreementModal not defined');
}catch(e){ console.warn('Error exposing modal helpers:', e); }

// Fallback listeners for renderer modules that dispatch events when globals are missing
window.addEventListener('open-bill-modal', (ev)=>{ try{ if(typeof openBillModal==='function') openBillModal(ev.detail); }catch(e){ console.error('open-bill-modal handler failed', e); } });
window.addEventListener('open-task-modal', (ev)=>{ try{ if(typeof openTaskModal==='function') openTaskModal(ev.detail); }catch(e){ console.error('open-task-modal handler failed', e); } });
window.addEventListener('open-member-modal', (ev)=>{ try{ if(typeof openMemberModal==='function') openMemberModal(ev.detail); }catch(e){ console.error('open-member-modal handler failed', e); } });
window.addEventListener('open-project-modal', (ev)=>{ try{ if(typeof openProjectModal==='function') openProjectModal(ev.detail); }catch(e){ console.error('open-project-modal handler failed', e); } });
window.addEventListener('open-agreement-modal', (ev)=>{ try{ if(typeof openAgreementModal==='function') openAgreementModal(ev.detail); }catch(e){ console.error('open-agreement-modal handler failed', e); } });

// openCardModal moved to modules/card-modal.js to keep main.js small

/* ============================= RENDER DISPATCH ============================= */
async function render(){
  try{
    renderNav();
    renderTicker();
    if(state.view==='dashboard') window.renderDashboard();
    else if(state.view==='kanban') window.renderKanban();
    else if(state.view==='workload') window.renderWorkload();
    else if(state.view==='projects') window.renderProjects();
    else if(state.view==='team') window.renderTeam();
    else if(state.view==='oneonones') window.renderOneOnOnes();
    else if(state.view==='bills') window.renderBills();
    else if(state.view==='agreements') window.renderAgreements();
  }catch(err){
    console.error('Render error:', err);
    const view = document.getElementById('view');
    if(view){
      view.innerHTML = `<div class="empty">Something didn't render right on this view.<br>Your data is safe — try switching views, or reload if it persists.</div>`;
    }
    toast('A display error was caught — data untouched');
  }
}
// Make render available on window for modules that call `window.render()`
window.render = render;

window.addEventListener('error', (e)=>{
  console.error('Caught error:', e.error || e.message);
});

/* ============================= PDF EXPORT ============================= */
const EXPORT_SECTIONS = [
  { key:'dashboard', title:'Dashboard', desc:'Snapshot stats, tasks by status, workload & project progress' },
  { key:'kanban', title:'Kanban', desc:'All tickets grouped by status column, with checkboxes' },
  { key:'workload', title:'Workload', desc:'Active hours vs weekly capacity per teammate' },
  { key:'projects', title:'Projects', desc:'Project list with completion progress' },
  { key:'team', title:'Team', desc:'Members, roles and weekly capacity' },
  { key:'bills', title:'Bills', desc:'Invoices with line items and totals' },
  { key:'agreements', title:'Agreements', desc:'Verbal deals & billing terms' },
];

/* -- PDF geometry / colors -- */
const PAGE_W = 612, PAGE_H = 792, MARGIN = 50;
const CONTENT_W = PAGE_W - MARGIN * 2;

/* Helvetica (WinAnsi) can't encode some glyphs we use in the UI — swap them out. */
function sanitizePdfText(text){
  return String(text == null ? '' : text)
    .replace(/₹/g, 'Rs.')
    .replace(/→/g, '-')
    .replace(/·/g, '-')
    .replace(/[^\x20-\x7E\u00A0-\u00FF\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u2026]/g, '-');
}

function wrapText(font, text, size, maxWidth){
  text = sanitizePdfText(text);
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for(const word of words){
    const test = line ? line + ' ' + word : word;
    if(line && font.widthOfTextAtSize(test, size) > maxWidth){
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if(line) lines.push(line);
  return lines.length ? lines : [''];
}

function makePdfCtx(pdfDoc, font, fontBold, form, colors){
  return {
    pdfDoc, font, fontBold, form, colors,
    page: null,
    y: 0,
    newPage(){
      this.page = this.pdfDoc.addPage([PAGE_W, PAGE_H]);
      this.y = PAGE_H - MARGIN;
    },
    ensureSpace(needed){
      if(!this.page || this.y < MARGIN + needed) this.newPage();
    },
    header(title, sub){
      this.newPage();
      this.page.drawText(sanitizePdfText(title), { x: MARGIN, y: this.y, size: 18, font: this.fontBold, color: this.colors.dark });
      this.y -= 16;
      if(sub){
        this.page.drawText(sanitizePdfText(sub), { x: MARGIN, y: this.y, size: 9, font: this.font, color: this.colors.faint });
        this.y -= 12;
      }
      this.page.drawLine({ start:{ x: MARGIN, y: this.y }, end:{ x: PAGE_W - MARGIN, y: this.y }, thickness: 1, color: this.colors.line });
      this.y -= 14;
    },
    sectionTitle(title){
      this.ensureSpace(24);
      this.page.drawText(sanitizePdfText(title), { x: MARGIN, y: this.y, size: 12.5, font: this.fontBold, color: this.colors.accent });
      this.y -= 18;
    },
    paragraph(text, size = 9.5, color = null, lineHeight = 13){
      const c = color || this.colors.body;
      const lines = wrapText(this.font, text, size, CONTENT_W);
      for(const line of lines){
        this.ensureSpace(lineHeight);
        this.page.drawText(line, { x: MARGIN, y: this.y, size, font: this.font, color: c });
        this.y -= lineHeight;
      }
    },
  };
}

function drawTable(ctx, headers, rows, widths, opts = {}){
  const fontSize = opts.fontSize || 9;
  const headerSize = opts.headerSize || 8.5;
  const rowPad = 5;
  const tableLeft = MARGIN;
  const tableRight = PAGE_W - MARGIN;
  const totalWidth = tableRight - tableLeft;
  const sum = widths.reduce((a, b) => a + b, 0);
  const cols = widths.map(w => (w / sum) * totalWidth);
  const { colors } = ctx;

  const wrapCell = (text, f, s, w) => wrapText(f, text, s, Math.max(w - 4, 24));

  const headerLines = headers.map((h, i) => wrapCell(h, ctx.fontBold, headerSize, cols[i]));
  const headerHeight = Math.max(1, ...headerLines.map(l => l.length)) * (headerSize + 3) + rowPad * 2;

  const rowsData = rows.map(r => {
    const cells = r.map((val, i) => wrapCell(val, ctx.font, fontSize, cols[i]));
    const height = Math.max(1, ...cells.map(c => c.length)) * (fontSize + 3) + rowPad * 2;
    return { cells, height };
  });

  const drawHeader = () => {
    const yTop = ctx.y;
    ctx.page.drawRectangle({
      x: tableLeft, y: yTop - headerHeight,
      width: totalWidth, height: headerHeight,
      color: colors.headerBg,
    });
    let cx = tableLeft;
    headerLines.forEach((lines, i) => {
      let ty = yTop - rowPad - headerSize;
      lines.forEach(line => {
        ctx.page.drawText(line, { x: cx + 4, y: ty, size: headerSize, font: ctx.fontBold, color: colors.dark });
        ty -= headerSize + 3;
      });
      cx += cols[i];
    });
    ctx.y -= headerHeight;
  };

  ctx.ensureSpace(headerHeight + 14);
  drawHeader();

  rowsData.forEach((rd, ri) => {
    const prev = ctx.page;
    ctx.ensureSpace(rd.height);
    if(ctx.page !== prev) drawHeader();
    const yTop = ctx.y;
    if(ri % 2 === 1){
      ctx.page.drawRectangle({
        x: tableLeft, y: yTop - rd.height,
        width: totalWidth, height: rd.height,
        color: colors.zebra,
      });
    }
    ctx.page.drawLine({ start:{ x: tableLeft, y: yTop }, end:{ x: tableRight, y: yTop }, thickness: 0.5, color: colors.line });
    let cx = tableLeft;
    rd.cells.forEach((lines, i) => {
      let ty = yTop - rowPad - fontSize;
      lines.forEach(line => {
        ctx.page.drawText(line, { x: cx + 4, y: ty, size: fontSize, font: ctx.font, color: colors.body });
        ty -= fontSize + 3;
      });
      cx += cols[i];
    });
    ctx.y -= rd.height;
  });
  ctx.page.drawLine({ start:{ x: tableLeft, y: ctx.y }, end:{ x: tableRight, y: ctx.y }, thickness: 0.5, color: colors.line });
  ctx.y -= 12;
}

/* -- PDF section renderers moved to modules/pdf-sections.js -- */

/* -- Export modal -- */
function openExportModal(){
  const options = EXPORT_SECTIONS.map(s => `
    <label class="export-option">
      <input type="checkbox" value="${s.key}" checked>
      <span class="export-opt-label">
        <span class="export-opt-title">${s.title}</span>
        <span class="export-opt-desc">${s.desc}</span>
      </span>
    </label>`).join('');

  openModal(`
    <div class="modal-title">Export data (PDF)</div>
    <div class="field"><label>Pick the sections to include</label>
      <div class="export-section-list" id="exportSectionList">${options}</div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" id="exportNoneBtn">Select none</button>
      <button class="btn btn-ghost" id="cancelBtn">Cancel</button>
      <button class="btn btn-primary" id="generatePdfBtn">Generate PDF</button>
    </div>
  `);

  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  document.getElementById('exportNoneBtn').addEventListener('click', ()=>{
    document.querySelectorAll('#exportSectionList input').forEach(cb => cb.checked = false);
  });
  document.getElementById('generatePdfBtn').addEventListener('click', async ()=>{
    const selected = [...document.querySelectorAll('#exportSectionList input:checked')].map(cb => cb.value);
    if(!selected.length){ toast('Pick at least one section'); return; }
    closeModal();
    toast('Building PDF…');
    try{
      // Load PDF builder lazily (heavy). modules/pdf.js reuses section renderers already on window.
      const mod = await import('./modules/pdf.js');
      await mod.buildExportPDF(selected);
      toast('PDF exported');
    }catch(err){
      console.error(err);
      toast('Export failed — see console');
    }
  });
}

document.getElementById('exportBtn').addEventListener('click', openExportModal);

/* ============================= INIT ============================= */
DB.onReady(() => {
  DB.restoreState(state);
  render();
});
