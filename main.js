
/* ============================= MOBILE DRAWER ============================= */
const sidebarEl = document.getElementById('sidebarEl');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');
function openSidebar(){ sidebarEl.classList.add('open'); sidebarBackdrop.classList.add('open'); }
function closeSidebar(){ sidebarEl.classList.remove('open'); sidebarBackdrop.classList.remove('open'); }
document.getElementById('hamburgerBtn').addEventListener('click', openSidebar);
sidebarBackdrop.addEventListener('click', closeSidebar);

/* ============================= THEME ============================= */
let themePref = 'system'; // 'light' | 'dark' | 'system'
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
  taskSeq: 9,
  members: [
    {id:'mem-1', name:'Asha Rao', role:'Frontend Engineer', capacity:40},
    {id:'mem-2', name:'Devan Iyer', role:'Backend Engineer', capacity:40},
    {id:'mem-3', name:'Priya Nair', role:'Product Designer', capacity:32},
    {id:'mem-4', name:'Karan Mehta', role:'QA Lead', capacity:36},
  ],
  projects: [
    {id:'proj-1', name:'Aurora Launch', color:'#4FD1C5'},
    {id:'proj-2', name:'Client Onboarding', color:'#F2B84B'},
    {id:'proj-3', name:'Internal Tooling', color:'#8AA4FF'},
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
  {key:'agreements', icon:'✎', label:'Agreements'},
];

function renderNav(){
  const nav = document.getElementById('navList');
  nav.innerHTML = NAV.map(n=>{
    let count = '';
    if(n.key==='kanban') count = state.tasks.length;
    if(n.key==='team') count = state.members.length;
    if(n.key==='projects') count = state.projects.length;
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
  const cells = [
    {label:'Active tasks', value: total - doneCount, cls:''},
    {label:'In progress', value: inProgress, cls:'amber'},
    {label:'Overdue', value: overdue, cls:'danger'},
    {label:'Completed', value: doneCount, cls:'success'},
    {label:'Team size', value: state.members.length, cls:'teal'},
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
        if(t){ t.status = col.dataset.col; renderNav(); renderTicker(); drawBoard(); }
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
      state.tasks.forEach(t=>{ if(t.projectId===p.id) t.projectId=''; });
      state.projects = state.projects.filter(x=>x.id!==p.id);
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
      state.tasks.forEach(t=>{ if(t.assigneeId===m.id) t.assigneeId=''; });
      state.members = state.members.filter(x=>x.id!==m.id);
      renderNav(); renderTicker(); renderTeam();
      toast('Teammate removed');
    });
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
    state.agreements.push({
      id: uid('agr'),
      title,
      party: document.getElementById('aParty').value.trim() || '—',
      amount: document.getElementById('aAmount').value.trim(),
      status: document.getElementById('aStatus').value,
      dateAgreed: document.getElementById('aDate').value || '2026-07-29',
      terms,
    });
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
    state.tasks.push({
      id: nextTaskId(),
      title,
      projectId: document.getElementById('fProject').value,
      assigneeId: document.getElementById('fMember').value,
      status: 'todo',
      priority: document.getElementById('fPriority').value,
      due: document.getElementById('fDue').value || '2026-08-05',
      hours: Number(document.getElementById('fHours').value) || 4,
    });
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
      toast('Teammate updated');
    } else {
      state.members.push({ id: uid('mem'), name, role, capacity });
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
      <select id="pColor">${palette.map(c=>`<option value="${c}" ${existing && existing.color===c ? 'selected':''}>${c}</option>`).join('')}</select>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" id="cancelBtn">Cancel</button>
      <button class="btn btn-primary" id="saveProjBtn">${existing ? 'Save changes' : 'Create project'}</button>
    </div>
  `);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  document.getElementById('saveProjBtn').addEventListener('click', ()=>{
    const name = document.getElementById('pName').value.trim();
    if(!name){ toast('Name is required'); return; }
    const color = document.getElementById('pColor').value;
    if(existing){
      existing.name = name; existing.color = color;
      toast('Project updated');
    } else {
      state.projects.push({ id: uid('proj'), name, color });
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
async function exportPDF(){
  try{
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const form = pdfDoc.getForm();

    const pageW = 612, pageH = 792;
    let page = pdfDoc.addPage([pageW, pageH]);
    let y = pageH - 60;

    page.drawText('Ops Console — Ticket Sheet', { x: 50, y, size: 18, font: fontBold, color: rgb(0.1,0.1,0.12) });
    y -= 18;
    page.drawText('Check completed tickets, save, and re-import into the console to sync.', { x:50, y, size:9, font, color: rgb(0.4,0.4,0.4) });
    y -= 26;

    STATUS_COLS.forEach(()=>{});

    state.tasks.forEach(t=>{
      if(y < 80){ page = pdfDoc.addPage([pageW, pageH]); y = pageH - 60; }
      const cb = form.createCheckBox('chk_' + t.id);
      cb.addToPage(page, { x:50, y: y-10, width:12, height:12, borderColor: rgb(0.6,0.6,0.6), borderWidth:1 });
      if(t.status==='done') cb.check();

      const m = member(t.assigneeId); const p = project(t.projectId);
      page.drawText(`${t.id}`, { x:70, y, size:9, font, color: rgb(0.5,0.5,0.5) });
      page.drawText(`${t.title}`, { x:118, y, size:10.5, font: fontBold, color: rgb(0.08,0.08,0.1) });
      y -= 13;
      page.drawText(`${p?p.name:'—'}  ·  ${m?m.name:'Unassigned'}  ·  due ${t.due}  ·  status: ${t.status}`, { x:118, y, size:8.5, font, color: rgb(0.45,0.45,0.45) });
      y -= 22;
    });

    const bytes = await pdfDoc.save();
    const blob = new Blob([bytes], { type:'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'ops-console-ticket-sheet.pdf';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    toast('Ticket sheet exported');
  }catch(err){
    console.error(err);
    toast('Export failed — see console');
  }
}

document.getElementById('exportBtn').addEventListener('click', exportPDF);

/* ============================= INIT ============================= */
render();
