
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

const state = {
  view: 'dashboard',
  taskSeq: 13,
  members: [
    {id:'mem-1', name:'Abhijeet', role:'Low-Level Design', capacity:38},
    {id:'mem-2', name:'Pandey Ji', role:'Model and protype', capacity:35},
    {id:'mem-3', name:'Ashutosh Ji', role:'High-Level Design', capacity:32},
    {id:'mem-4', name:'Jaiswal', role:'Veriification team', capacity:30},
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

const STATUS_COLS = [
  {key:'todo', label:'To Do'},
  {key:'progress', label:'In Progress'},
  {key:'review', label:'Review'},
  {key:'done', label:'Done'},
];

let charts = {};

/* ============================= HELPERS ============================= */
function member(id){ return state.members.find(m=>m.id===id); }
function project(id){ return state.projects.find(p=>p.id===id); }
function initials(name){ return name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(); }
function isOverdue(task){ return task.status!=='done' && new Date(task.due) < new Date('2026-07-29'); }
function fmtDate(d){ const dt=new Date(d); return dt.toLocaleDateString('en-US',{month:'short', day:'numeric'}); }

/* ============================= BILL HELPERS ============================= */
function formatCurrency(n){ return '₹' + Number(n).toLocaleString('en-IN', {minimumFractionDigits:0, maximumFractionDigits:0}); }
function calcSubtotal(items){ return items.reduce((s,i)=> s + (i.hours * i.rate), 0); }
function calcTax(subtotal, rate){ return Math.round(subtotal * (rate/100)); }
function calcBillTotal(bill){
  const sub = calcSubtotal(bill.lineItems);
  return sub + calcTax(sub, bill.taxRate);
}
function nextBillNumber(){
  state.billSeq++;
  return 'INV-' + String(state.billSeq).padStart(3,'0');
}
function billMember(bill){ return member(bill.memberId); }
function billStatusClass(s){ return s==='paid'?'success':s==='overdue'?'danger':s==='sent'?'amber':s==='draft'?'':'teal'; }

function toast(msg){
  const t=document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(()=>t.classList.remove('show'), 3200);
}
function nextTaskId(){ state.taskSeq++; return 'TSK-' + String(state.taskSeq).padStart(3,'0'); }

/* ============================= NAV ============================= */
const NAV = [
  {key:'dashboard', icon:'◈', label:'Dashboard'},
  {key:'kanban', icon:'▤', label:'Kanban'},
  {key:'workload', icon:'▮', label:'Workload'},
  {key:'projects', icon:'◫', label:'Projects'},
  {key:'team', icon:'◍', label:'Team'},
  {key:'bills', icon:'💰', label:'Bills'},
  {key:'agreements', icon:'✎', label:'Agreements'},
];

function renderNav(){
  const nav = document.getElementById('navList');
  nav.innerHTML = NAV.map(n=>{
    let count = '';
    if(n.key==='kanban') count = state.tasks.length;
    if(n.key==='team') count = state.members.length;
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
function renderDashboard(){
  const view = document.getElementById('view');
  view.innerHTML = `
    <div class="view-head">
      <div>
        <div class="view-title">Dashboard</div>
        <div class="view-sub">SNAPSHOT — ${new Date('2026-07-29').toDateString().toUpperCase()}</div>
      </div>
    </div>
    <div class="dash-grid">
      <div class="panel"><div class="panel-title">Tasks by status</div><div class="chart-wrap"><canvas id="chartStatus"></canvas></div></div>
      <div class="panel"><div class="panel-title">Workload by teammate (hrs)</div><div class="chart-wrap"><canvas id="chartWorkload"></canvas></div></div>
      <div class="panel full-span"><div class="panel-title">Project progress</div><div class="chart-wrap tall"><canvas id="chartProjects"></canvas></div></div>
    </div>
  `;

  try{
    Object.values(charts).forEach(c=>c && c.destroy && c.destroy());

    const statusCounts = STATUS_COLS.map(s=> state.tasks.filter(t=>t.status===s.key).length);
    charts.status = new Chart(document.getElementById('chartStatus'), {
      type:'doughnut',
      data:{ labels: STATUS_COLS.map(s=>s.label), datasets:[{ data: statusCounts, backgroundColor:['#8B98A5','#F2B84B','#8AA4FF','#5FBF7A'], borderColor:'#161D22', borderWidth:2 }]},
      options:{ plugins:{ legend:{ position:'bottom', labels:{ color:'#8B98A5', font:{family:'Inter', size:11}, boxWidth:10 } } }, maintainAspectRatio:false }
    });

    const wlLabels = state.members.map(m=>m.name.split(' ')[0]);
    const wlData = state.members.map(m => state.tasks.filter(t=>t.assigneeId===m.id && t.status!=='done').reduce((a,t)=>a+t.hours,0));
    charts.workload = new Chart(document.getElementById('chartWorkload'), {
      type:'bar',
      data:{ labels: wlLabels, datasets:[{ label:'Assigned hrs', data: wlData, backgroundColor:'#F2B84B', borderRadius:4, maxBarThickness:34 }]},
      options:{ scales:{ x:{ ticks:{color:'#8B98A5'}, grid:{display:false} }, y:{ ticks:{color:'#8B98A5'}, grid:{color:'#232C33'} } }, plugins:{legend:{display:false}}, maintainAspectRatio:false }
    });

    const projDone = state.projects.map(p => state.tasks.filter(t=>t.projectId===p.id && t.status==='done').length);
    const projTotal = state.projects.map(p => state.tasks.filter(t=>t.projectId===p.id).length);
    const projRemaining = projTotal.map((t,i)=>t - projDone[i]);
    charts.projects = new Chart(document.getElementById('chartProjects'), {
      type:'bar',
      data:{ labels: state.projects.map(p=>p.name), datasets:[
        { label:'Done', data: projDone, backgroundColor:'#5FBF7A', stack:'s', borderRadius:4 },
        { label:'Remaining', data: projRemaining, backgroundColor:'#2A333C', stack:'s', borderRadius:4 },
      ]},
      options:{ indexAxis:'y', scales:{ x:{ stacked:true, ticks:{color:'#8B98A5'}, grid:{color:'#232C33'} }, y:{ stacked:true, ticks:{color:'#E8EDF1'}, grid:{display:false} } }, plugins:{ legend:{ position:'bottom', labels:{color:'#8B98A5', boxWidth:10} } }, maintainAspectRatio:false }
    });
  }catch(err){
    console.error('Chart render failed:', err);
    document.querySelectorAll('.chart-wrap').forEach(el=>{
      el.innerHTML = '<div class="empty">Chart unavailable right now — figures are still accurate in the other views.</div>';
    });
  }
}

/* ============================= KANBAN ============================= */
function renderKanban(){
  const view = document.getElementById('view');
  const projOptions = state.projects.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
  const memberOptions = state.members.map(m=>`<option value="${m.id}">${m.name}</option>`).join('');

  view.innerHTML = `
    <div class="view-head">
      <div>
        <div class="view-title">Kanban</div>
        <div class="view-sub">DRAG TICKETS BETWEEN COLUMNS</div>
      </div>
      <div class="view-actions">
        <select class="filter" id="filterProject"><option value="">All projects</option>${projOptions}</select>
        <select class="filter" id="filterMember"><option value="">All teammates</option>${memberOptions}</select>
        <button class="btn btn-primary" id="addTaskBtn">+ New ticket</button>
      </div>
    </div>
    <div class="kanban-board" id="kanbanBoard"></div>
  `;

  document.getElementById('addTaskBtn').addEventListener('click', openTaskModal);
  document.getElementById('filterProject').addEventListener('change', drawBoard);
  document.getElementById('filterMember').addEventListener('change', drawBoard);

  function drawBoard(){
    const fp = document.getElementById('filterProject').value;
    const fm = document.getElementById('filterMember').value;
    const filtered = state.tasks.filter(t => (!fp || t.projectId===fp) && (!fm || t.assigneeId===fm));
    const board = document.getElementById('kanbanBoard');
    board.innerHTML = STATUS_COLS.map(col=>{
      const tasks = filtered.filter(t=>t.status===col.key);
      return `
        <div class="kanban-col" data-col="${col.key}">
          <div class="kanban-col-head"><span>${col.label}</span><span>${tasks.length}</span></div>
          <div class="kanban-col-body" data-dropzone="${col.key}">
            ${tasks.length ? tasks.map(ticketHTML).join('') : '<div class="empty">— empty —</div>'}
          </div>
        </div>`;
    }).join('');
    wireDnD();
  }
  drawBoard();

  function ticketHTML(t){
    const m = member(t.assigneeId);
    const p = project(t.projectId);
    const overdue = isOverdue(t);
    return `
      <div class="ticket" draggable="true" data-task="${t.id}">
        <div class="ticket-meta">
          <span class="ticket-id">${t.id}</span>
          <button class="ticket-del" data-del="${t.id}" title="Delete">✕</button>
        </div>
        <div class="ticket-title">${escapeHTML(t.title)}</div>
        <div class="ticket-meta">
          <span class="tag prio-${t.priority}">${t.priority}</span>
          <span class="avatar" title="${m?m.name:'Unassigned'}">${m?initials(m.name):'—'}</span>
        </div>
        <div class="ticket-foot">
          <span><span class="proj-dot" style="background:${p?p.color:'#666'}"></span>${p?p.name:'—'}</span>
          <span class="due-chip ${overdue?'overdue':''}">${fmtDate(t.due)}</span>
        </div>
      </div>`;
  }

  function wireDnD(){
    document.querySelectorAll('.ticket').forEach(el=>{
      el.addEventListener('dragstart', e=>{
        e.dataTransfer.setData('text/plain', el.dataset.task);
        el.classList.add('dragging');
      });
      el.addEventListener('dragend', ()=> el.classList.remove('dragging'));
    });
    document.querySelectorAll('[data-del]').forEach(btn=>{
      btn.addEventListener('click', e=>{
        e.stopPropagation();
        state.tasks = state.tasks.filter(t=>t.id!==btn.dataset.del);
        DB.remove('tasks', 'id', btn.dataset.del);
        renderNav(); renderTicker(); drawBoard();
        toast('Ticket removed');
      });
    });
    document.querySelectorAll('.kanban-col').forEach(col=>{
      col.addEventListener('dragover', e=>{ e.preventDefault(); col.classList.add('drag-over'); });
      col.addEventListener('dragleave', ()=> col.classList.remove('drag-over'));
      col.addEventListener('drop', e=>{
        e.preventDefault();
        col.classList.remove('drag-over');
        const taskId = e.dataTransfer.getData('text/plain');
        const t = state.tasks.find(t=>t.id===taskId);
        if(t){ t.status = col.dataset.col; DB.update('tasks', { status: t.status }, 'id', t.id); renderNav(); renderTicker(); drawBoard(); }
      });
    });
  }
}

function escapeHTML(s){
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

/* ============================= WORKLOAD ============================= */
function renderWorkload(){
  const view = document.getElementById('view');
  view.innerHTML = `
    <div class="view-head">
      <div><div class="view-title">Workload</div><div class="view-sub">ACTIVE HOURS VS WEEKLY CAPACITY</div></div>
    </div>
    <div class="panel">
      ${state.members.map(m=>{
        const hrs = state.tasks.filter(t=>t.assigneeId===m.id && t.status!=='done').reduce((a,t)=>a+t.hours,0);
        const pct = Math.min(100, Math.round((hrs/m.capacity)*100));
        const color = pct>95 ? 'var(--danger)' : pct>70 ? 'var(--amber)' : 'var(--teal)';
        const activeTasks = state.tasks.filter(t=>t.assigneeId===m.id && t.status!=='done').length;
        return `
        <div class="workload-row">
          <div>
            <div class="wl-name">${m.name}</div>
            <div class="wl-role">${m.role} · ${activeTasks} active</div>
          </div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%; background:${color};"></div></div>
          <div class="wl-figure">${hrs}h / ${m.capacity}h</div>
        </div>`;
      }).join('')}
    </div>
  `;
}

/* ============================= PROJECTS ============================= */
function renderProjects(){
  const view = document.getElementById('view');
  view.innerHTML = `
    <div class="view-head">
      <div><div class="view-title">Projects</div><div class="view-sub">${state.projects.length} ACTIVE</div></div>
      <div class="view-actions"><button class="btn btn-primary" id="addProjBtn">+ New project</button></div>
    </div>
    <div class="proj-grid">
      ${state.projects.map(p=>{
        const tasks = state.tasks.filter(t=>t.projectId===p.id);
        const done = tasks.filter(t=>t.status==='done').length;
        return `
        <div class="proj-card" style="--accent:${p.color}">
          <div class="card-top-row">
            <div class="proj-card-name">${escapeHTML(p.name)}</div>
            <div class="card-actions">
              <button class="icon-btn" data-edit-proj="${p.id}" title="Edit">✎</button>
              <button class="icon-btn" data-del-proj="${p.id}" title="Delete">✕</button>
            </div>
          </div>
          <div class="proj-color-row">
            <span class="swatch-dot-sm" style="background:${p.color}"></span>
            <span class="proj-color-hex">${p.color}</span>
          </div>
          <div class="proj-card-stat">${done}/${tasks.length} tickets done</div>
          <div class="bar-track"><div class="bar-fill" style="width:${tasks.length?Math.round(done/tasks.length*100):0}%; background:${p.color};"></div></div>
        </div>`;
      }).join('') || '<div class="empty">No projects yet</div>'}
    </div>
  `;
  document.getElementById('addProjBtn').addEventListener('click', ()=>openProjectModal());
  document.querySelectorAll('[data-edit-proj]').forEach(btn=>{
    btn.addEventListener('click', ()=> openProjectModal(project(btn.dataset.editProj)));
  });
  document.querySelectorAll('[data-del-proj]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const p = project(btn.dataset.delProj);
      if(!p) return;
      const linked = state.tasks.filter(t=>t.projectId===p.id).length;
      const msg = linked ? `Delete "${p.name}"? ${linked} ticket(s) will become unassigned from a project.` : `Delete "${p.name}"?`;
      if(!window.confirm(msg)) return;
      state.tasks.forEach(t=>{ if(t.projectId===p.id){ t.projectId=''; DB.update('tasks', { projectId:'' }, 'id', t.id); } });
      state.projects = state.projects.filter(x=>x.id!==p.id);
      DB.remove('projects', 'id', p.id);
      renderNav(); renderTicker(); renderProjects();
      toast('Project deleted');
    });
  });
}

/* ============================= TEAM ============================= */
function renderTeam(){
  const view = document.getElementById('view');
  view.innerHTML = `
    <div class="view-head">
      <div><div class="view-title">Team</div><div class="view-sub">${state.members.length} MEMBERS</div></div>
      <div class="view-actions"><button class="btn btn-primary" id="addMemberBtn">+ Add teammate</button></div>
    </div>
    <div class="team-grid">
      ${state.members.map(m=>`
        <div class="member-card">
          <div class="member-avatar">${initials(m.name)}</div>
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
      renderNav(); renderTicker(); renderTeam();
      toast('Teammate removed');
    });
  });
}

/* ============================= BILLS ============================= */
function renderBills(){
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

  function drawBills(){
    const fs = document.getElementById('billFilterStatus').value;
    const fm = document.getElementById('billFilterMember').value;
    const filtered = state.bills.filter(b => (!fs || b.status===fs) && (!fm || b.memberId===fm));
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
      btn.addEventListener('click', e=>{ e.stopPropagation(); openBillModal(state.bills.find(b=>b.id===btn.dataset.billEdit)); });
    });
    document.querySelectorAll('[data-bill-del]').forEach(btn=>{
      btn.addEventListener('click', e=>{
        e.stopPropagation();
        const b = state.bills.find(x=>x.id===btn.dataset.billDel);
        if(!b || !window.confirm(`Delete ${b.billNumber}?`)) return;
        state.bills = state.bills.filter(x=>x.id!==b.id);
        DB.remove('bills', 'id', b.id);
        renderNav(); renderTicker(); renderBills();
        toast('Invoice deleted');
      });
    });
    document.querySelectorAll('[data-bill-status]').forEach(btn=>{
      btn.addEventListener('click', e=>{
        e.stopPropagation();
        const b = state.bills.find(x=>x.id===btn.dataset.billStatus);
        if(!b) return;
        const next = {draft:'sent', sent:'paid', paid:'paid', overdue:'paid'}[b.status] || 'paid';
        b.status = next;
        DB.update('bills', { status: b.status }, 'id', b.id);
        renderNav(); renderTicker(); drawBills();
        toast(`Invoice marked as ${next}`);
      });
    });
  }
}

function billCardHTML(b){
  const m = billMember(b);
  const sub = calcSubtotal(b.lineItems);
  const tax = calcTax(sub, b.taxRate);
  const total = sub + tax;
  const overdue = b.status==='sent' && new Date(b.dueDate) < new Date('2026-08-01');
  const effectiveStatus = overdue ? 'overdue' : b.status;
  if(overdue && b.status!=='overdue'){ b.status='overdue'; DB.update('bills', { status:'overdue' }, 'id', b.id); }
  const statusCls = billStatusClass(effectiveStatus);

  return `
    <div class="invoice-card ${b._expanded?'expanded':''}">
      <div class="invoice-head" data-bill-toggle>
        <div class="invoice-head-left">
          <span class="invoice-num">${b.billNumber}</span>
          <span class="invoice-member">${m ? escapeHTML(m.name) : 'Unassigned'}</span>
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
    <div class="field"><label>Bill to (team member)</label><select id="fBillMember">${memberOptions}</select></div>
    <div class="row2">
      <div class="field"><label>Period start</label><input id="fPeriodStart" type="date" value="${existing ? existing.periodStart : '2026-08-01'}"></div>
      <div class="field"><label>Period end</label><input id="fPeriodEnd" type="date" value="${existing ? existing.periodEnd : '2026-08-31'}"></div>
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
      <div class="field"><label>Issue date</label><input id="fIssueDate" type="date" value="${existing ? existing.issueDate : '2026-08-01'}"></div>
      <div class="field"><label>Due date</label><input id="fDueDate" type="date" value="${existing ? existing.dueDate : '2026-08-15'}"></div>
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

    if(items.length===0){ toast('Add at least one line item'); return; }

    if(existing){
      existing.memberId = memberId;
      existing.periodStart = periodStart;
      existing.periodEnd = periodEnd;
      existing.lineItems = items;
      existing.taxRate = taxRate;
      existing.status = status;
      existing.issueDate = issueDate;
      existing.dueDate = dueDate;
      existing.notes = notes;
      DB.update('bills', { memberId, periodStart, periodEnd, taxRate, status, issueDate, dueDate, notes }, 'id', existing.id);
      DB.replaceLineItems(existing.id, items);
      toast('Invoice updated');
    } else {
      const bill = {
        id: uid('bill'),
        memberId,
        billNumber: nextBillNumber(),
        periodStart,
        periodEnd,
        lineItems: items,
        taxRate,
        status,
        issueDate,
        dueDate,
        notes,
      };
      state.bills.push(bill);
      DB.insert('bills', { id: bill.id, memberId, billNumber: bill.billNumber, periodStart, periodEnd, taxRate, status, issueDate, dueDate, notes });
      DB.replaceLineItems(bill.id, items);
      DB.setMeta('billSeq', state.billSeq);
      toast('Invoice created');
    }
    closeModal(); renderNav(); renderTicker(); renderBills();
  });
}

/* ============================= AGREEMENTS ============================= */
function renderAgreements(){
  const view = document.getElementById('view');
  view.innerHTML = `
    <div class="view-head">
      <div>
        <div class="view-title">Agreements</div>
        <div class="view-sub">VERBAL DEALS &amp; BILLING TERMS — MANUAL, KEPT VISIBLE HERE</div>
      </div>
      <div class="view-actions"><button class="btn btn-primary" id="addAgrBtn">+ Log an agreement</button></div>
    </div>
    <div class="agr-list" id="agrList">
      ${state.agreements.length ? state.agreements.map(agreementHTML).join('') : '<div class="empty">No agreements logged yet — add the terms you\'ve verbally agreed on so they stay visible to everyone.</div>'}
    </div>
  `;
  document.getElementById('addAgrBtn').addEventListener('click', openAgreementModal);
document.querySelectorAll('[data-agr-del]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      state.agreements = state.agreements.filter(a=>a.id!==btn.dataset.agrDel);
      DB.remove('agreements', 'id', btn.dataset.agrDel);
      renderNav(); renderAgreements();
      toast('Agreement removed');
    });
  });
}

function agreementHTML(a){
  return `
    <div class="agr-card">
      <div class="agr-head">
        <div>
          <div class="agr-title">${escapeHTML(a.title)}</div>
          <div class="agr-party">${escapeHTML(a.party)}</div>
        </div>
        <div class="agr-badges">
          <span class="agr-amount">${escapeHTML(a.amount || '')}</span>
          <span class="status-pill ${a.status}">${a.status}</span>
        </div>
      </div>
      <div class="agr-terms">${escapeHTML(a.terms)}</div>
      <div class="agr-foot">
        <span class="agr-date">Agreed ${fmtDate(a.dateAgreed)}</span>
        <button class="agr-del" data-agr-del="${a.id}">Remove</button>
      </div>
    </div>`;
}

function openAgreementModal(){
  openModal(`
    <div class="modal-title">Log an agreement</div>
    <div class="field"><label>Title</label><input id="aTitle" placeholder="e.g. Aurora Corp — Retainer terms"></div>
    <div class="field"><label>Who it's with</label><input id="aParty" placeholder="e.g. Aurora Corp (client), or a teammate's name"></div>
    <div class="row2">
      <div class="field"><label>Amount / rate (optional)</label><input id="aAmount" placeholder="e.g. ₹1,20,000/month"></div>
      <div class="field"><label>Status</label><select id="aStatus"><option value="active">Active</option><option value="settled">Settled</option><option value="disputed">Disputed</option></select></div>
    </div>
    <div class="field"><label>Date agreed</label><input id="aDate" type="date" value="2026-07-29"></div>
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
      dateAgreed: document.getElementById('aDate').value || '2026-07-29',
      terms,
    };
    state.agreements.push(agr);
    DB.insert('agreements', agr);
    closeModal(); renderNav(); renderAgreements();
    toast('Agreement logged');
  });
}

/* ============================= MODALS ============================= */
function openModal(html){
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('modalBackdrop').classList.add('open');
}
function closeModal(){ document.getElementById('modalBackdrop').classList.remove('open'); }
document.getElementById('modalBackdrop').addEventListener('click', e=>{ if(e.target.id==='modalBackdrop') closeModal(); });

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
    <div class="field"><label>Due date</label><input id="fDue" type="date" value="2026-08-05"></div>
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
      due: document.getElementById('fDue').value || '2026-08-05',
      hours: Number(document.getElementById('fHours').value) || 4,
    };
    state.tasks.push(task);
    DB.insert('tasks', task);
    DB.setMeta('taskSeq', state.taskSeq);
    closeModal(); renderNav(); renderTicker(); renderKanban();
    toast('Ticket created');
  });
}

function openMemberModal(existing){
  openModal(`
    <div class="modal-title">${existing ? 'Edit teammate' : 'Add teammate'}</div>
    <div class="field"><label>Name</label><input id="mName" placeholder="e.g. Rhea Kapoor" value="${existing ? escapeHTML(existing.name) : ''}"></div>
    <div class="field"><label>Role</label><input id="mRole" placeholder="e.g. Backend Engineer" value="${existing ? escapeHTML(existing.role) : ''}"></div>
    <div class="field"><label>Weekly capacity (hrs)</label><input id="mCap" type="number" min="1" value="${existing ? existing.capacity : 40}"></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" id="cancelBtn">Cancel</button>
      <button class="btn btn-primary" id="saveMemberBtn">${existing ? 'Save changes' : 'Add teammate'}</button>
    </div>
  `);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  document.getElementById('saveMemberBtn').addEventListener('click', ()=>{
    const name = document.getElementById('mName').value.trim();
    if(!name){ toast('Name is required'); return; }
    const role = document.getElementById('mRole').value.trim() || 'Contributor';
    const capacity = Number(document.getElementById('mCap').value) || 40;
    if(existing){
      existing.name = name; existing.role = role; existing.capacity = capacity;
      DB.update('members', { name, role, capacity }, 'id', existing.id);
      toast('Teammate updated');
    } else {
      const mem = { id: uid('mem'), name, role, capacity };
      state.members.push(mem);
      DB.insert('members', mem);
      toast('Teammate added');
    }
    closeModal(); renderNav(); renderTicker(); renderTeam();
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

/* ============================= RENDER DISPATCH ============================= */
function render(){
  try{
    renderNav();
    renderTicker();
    if(state.view==='dashboard') renderDashboard();
    else if(state.view==='kanban') renderKanban();
    else if(state.view==='workload') renderWorkload();
    else if(state.view==='projects') renderProjects();
    else if(state.view==='team') renderTeam();
    else if(state.view==='bills') renderBills();
    else if(state.view==='agreements') renderAgreements();
  }catch(err){
    console.error('Render error:', err);
    const view = document.getElementById('view');
    if(view){
      view.innerHTML = `<div class="empty">Something didn't render right on this view.<br>Your data is safe — try switching views, or reload if it persists.</div>`;
    }
    toast('A display error was caught — data untouched');
  }
}

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

/* -- Section renderers -- */
function pdfDashboard(ctx){
  ctx.header('Dashboard', 'SNAPSHOT — ' + new Date('2026-07-29').toDateString().toUpperCase());

  const total = state.tasks.length;
  const doneCount = state.tasks.filter(t => t.status === 'done').length;
  const inProgress = state.tasks.filter(t => t.status === 'progress').length;
  const overdue = state.tasks.filter(isOverdue).length;
  const totalBilled = state.bills.reduce((s, b) => s + calcBillTotal(b), 0);
  const paidBilled = state.bills.filter(b => b.status === 'paid').reduce((s, b) => s + calcBillTotal(b), 0);
  const outstanding = state.bills.filter(b => b.status === 'sent' || b.status === 'overdue').reduce((s, b) => s + calcBillTotal(b), 0);

  ctx.sectionTitle('Ticker');
  drawTable(ctx,
    ['Metric', 'Value'],
    [
      ['Active tasks', String(total - doneCount)],
      ['In progress', String(inProgress)],
      ['Overdue tasks', String(overdue)],
      ['Completed', String(doneCount)],
      ['Billed', formatCurrency(totalBilled)],
      ['Paid', formatCurrency(paidBilled)],
      ['Outstanding', formatCurrency(outstanding)],
    ],
    [3, 1]);

  ctx.sectionTitle('Tasks by status');
  drawTable(ctx,
    ['Status', 'Count'],
    STATUS_COLS.map(s => [s.label, String(state.tasks.filter(t => t.status === s.key).length)]),
    [3, 1]);

  ctx.sectionTitle('Workload by teammate');
  drawTable(ctx,
    ['Teammate', 'Role', 'Active hrs', 'Capacity'],
    state.members.map(m => [
      m.name, m.role,
      String(state.tasks.filter(t => t.assigneeId === m.id && t.status !== 'done').reduce((a, t) => a + t.hours, 0)),
      String(m.capacity) + 'h',
    ]),
    [2, 2.4, 1.1, 1]);

  ctx.sectionTitle('Project progress');
  drawTable(ctx,
    ['Project', 'Done', 'Total', '% Complete'],
    state.projects.map(p => {
      const tasks = state.tasks.filter(t => t.projectId === p.id);
      const done = tasks.filter(t => t.status === 'done').length;
      return [p.name, String(done), String(tasks.length), tasks.length ? Math.round(done / tasks.length * 100) + '%' : '0%'];
    }),
    [3, 1, 1, 1.2]);
}

function pdfKanban(ctx){
  ctx.header('Kanban', 'TICKETS GROUPED BY STATUS — ' + state.tasks.length + ' TOTAL');
  STATUS_COLS.forEach(col => {
    const tasks = state.tasks.filter(t => t.status === col.key);
    if(!tasks.length) return;
    ctx.sectionTitle(col.label + '  (' + tasks.length + ')');
    tasks.forEach(t => {
      ctx.ensureSpace(38);
      const cb = ctx.form.createCheckBox('chk_' + t.id);
      cb.addToPage(ctx.page, { x: MARGIN, y: ctx.y - 9, width: 11, height: 11, borderColor: ctx.colors.dim, borderWidth: 1 });
      if(t.status === 'done') cb.check();
      const m = member(t.assigneeId), p = project(t.projectId);
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
    state.members.map(m => {
      const hrs = state.tasks.filter(t => t.assigneeId === m.id && t.status !== 'done').reduce((a, t) => a + t.hours, 0);
      const pct = Math.round((hrs / m.capacity) * 100);
      return [m.name, m.role, String(hrs) + 'h', String(m.capacity) + 'h', pct + '%'];
    }),
    [1.8, 2.2, 1, 1, 1]);
}

function pdfProjects(ctx){
  ctx.header('Projects', state.projects.length + ' ACTIVE');
  drawTable(ctx,
    ['Project', 'Accent', 'Done', 'Total', '% Complete'],
    state.projects.map(p => {
      const tasks = state.tasks.filter(t => t.projectId === p.id);
      const done = tasks.filter(t => t.status === 'done').length;
      return [p.name, p.color, String(done), String(tasks.length), tasks.length ? Math.round(done / tasks.length * 100) + '%' : '0%'];
    }),
    [2.4, 1.2, 0.8, 0.8, 1.2]);
}

function pdfTeam(ctx){
  ctx.header('Team', state.members.length + ' MEMBERS');
  drawTable(ctx,
    ['Name', 'Role', 'Weekly capacity'],
    state.members.map(m => [m.name, m.role, String(m.capacity) + 'h']),
    [1.6, 2.2, 1.2]);
}

function pdfBills(ctx){
  ctx.header('Bills & Invoices', state.bills.length + ' INVOICES');
  const totalBilled = state.bills.reduce((s, b) => s + calcBillTotal(b), 0);
  ctx.paragraph('Total billed: ' + formatCurrency(totalBilled));
  ctx.y -= 4;
  if(!state.bills.length){
    ctx.paragraph('No invoices yet.', 9.5, ctx.colors.faint);
    return;
  }
  state.bills.forEach(b => {
    const m = billMember(b);
    const sub = calcSubtotal(b.lineItems);
    const tax = calcTax(sub, b.taxRate);
    const total = sub + tax;
    ctx.sectionTitle(b.billNumber + ' — ' + (m ? m.name : 'Unassigned') + '  ·  ' + b.status);
    ctx.paragraph('Period: ' + b.periodStart + ' → ' + b.periodEnd + '   |   Issued: ' + b.issueDate + '   |   Due: ' + b.dueDate, 8.5, ctx.colors.faint, 11);
    drawTable(ctx,
      ['Description', 'Hours', 'Rate', 'Amount'],
      b.lineItems.map(li => [li.description, String(li.hours), formatCurrency(li.rate) + '/hr', formatCurrency(li.hours * li.rate)]),
      [2.4, 0.7, 0.9, 1]);
    ctx.paragraph('Subtotal: ' + formatCurrency(sub) + '   |   Tax (' + b.taxRate + '%): ' + formatCurrency(tax) + '   |   Total: ' + formatCurrency(total), 9, ctx.colors.dark);
    if(b.notes) ctx.paragraph('Notes: ' + b.notes, 8.5, ctx.colors.faint, 11);
    ctx.y -= 8;
  });
}

function pdfAgreements(ctx){
  ctx.header('Agreements', 'VERBAL DEALS & BILLING TERMS');
  if(!state.agreements.length){
    ctx.paragraph('No agreements logged yet.', 9.5, ctx.colors.faint);
    return;
  }
  state.agreements.forEach(a => {
    ctx.ensureSpace(60);
    ctx.sectionTitle(a.title);
    ctx.paragraph(
      (a.party || '') + (a.amount ? '  ·  ' + a.amount : '') + '  ·  ' + a.status + '  ·  agreed ' + a.dateAgreed,
      8.5, ctx.colors.faint, 11);
    ctx.paragraph(a.terms || '', 9.5, ctx.colors.body);
    ctx.y -= 6;
  });
}

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
      await buildExportPDF(selected);
      toast('PDF exported');
    }catch(err){
      console.error(err);
      toast('Export failed — see console');
    }
  });
}

/* -- Build the multi-section PDF -- */
async function buildExportPDF(selected){
  const { PDFDocument, StandardFonts, rgb } = PDFLib;
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const form = pdfDoc.getForm();

  const colors = {
    dark:  rgb(0.08, 0.08, 0.1),
    body:  rgb(0.20, 0.20, 0.22),
    dim:   rgb(0.45, 0.45, 0.48),
    faint: rgb(0.55, 0.55, 0.58),
    accent:rgb(0.86, 0.62, 0.16),
    line:  rgb(0.84, 0.85, 0.87),
    headerBg: rgb(0.92, 0.93, 0.95),
    zebra: rgb(0.965, 0.966, 0.97),
  };

  const ctx = makePdfCtx(pdfDoc, font, fontBold, form, colors);

  if(selected.includes('dashboard')) pdfDashboard(ctx);
  if(selected.includes('kanban')) pdfKanban(ctx);
  if(selected.includes('workload')) pdfWorkload(ctx);
  if(selected.includes('projects')) pdfProjects(ctx);
  if(selected.includes('team')) pdfTeam(ctx);
  if(selected.includes('bills')) pdfBills(ctx);
  if(selected.includes('agreements')) pdfAgreements(ctx);

  if(!ctx.page) ctx.header('Ops Console', 'No sections were selected for export.');

  const bytes = await pdfDoc.save();
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ops-console-export.pdf';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

document.getElementById('exportBtn').addEventListener('click', openExportModal);

/* ============================= INIT ============================= */
DB.onReady(() => {
  DB.restoreState(state);
  render();
});
