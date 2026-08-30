function renderDashboard(){
  const view = document.getElementById('view');
  view.innerHTML = `
    <div class="view-head">
      <div>
        <div class="view-title">Dashboard</div>
        <div class="view-sub">SNAPSHOT — ${new Date().toDateString().toUpperCase()}</div>
      </div>
      <div class="view-actions">
        <button class="btn btn-primary" id="dashQuickAddBtn">+ Quick add ticket</button>
      </div>
    </div>
    <div class="dash-grid">
      <div class="panel"><div class="panel-title">Tasks by status</div><div class="chart-wrap"><canvas id="chartStatus"></canvas></div></div>
      <div class="panel"><div class="panel-title">Workload by teammate (hrs)</div><div class="chart-wrap"><canvas id="chartWorkload"></canvas></div></div>
      <div class="panel full-span"><div class="panel-title">Project progress</div><div class="chart-wrap tall"><canvas id="chartProjects"></canvas></div></div>
      <div class="panel full-span">
        <div class="panel-head-row">
          <div class="panel-title">Deadlines — overdue &amp; next 7 days</div>
          <button class="btn btn-sm btn-ghost" id="dashOpenBoard">Open board →</button>
        </div>
        <div id="dashDeadlines"></div>
      </div>
      <div class="panel full-span">
        <div class="panel-title">Project health</div>
        <div id="dashHealth" class="health-grid"></div>
      </div>
    </div>
  `;

  function _safeOpen(name, evtName, arg){ if(typeof window[name] === 'function'){ try{ if(arg!==undefined) window[name](arg); else window[name](); }catch(e){ console.error(e); }} else { window.dispatchEvent(new CustomEvent(evtName, { detail: arg })); } }
  document.getElementById('dashQuickAddBtn').addEventListener('click', ()=>_safeOpen('openTaskModal','open-task-modal'));
  document.getElementById('dashOpenBoard').addEventListener('click', ()=>{
    window.state.view = 'kanban';
    window.render();
  });

  try{
    window.initDashboardCharts(window.charts);
  }catch(err){
    console.error('Chart render failed:', err);
    document.querySelectorAll('.chart-wrap').forEach(el=>{
      el.innerHTML = '<div class="empty">Chart unavailable right now — figures are still accurate in the other views.</div>';
    });
  }

  renderDeadlines();
  renderHealth();

  function renderDeadlines(){
    const el = document.getElementById('dashDeadlines');
    if(!el) return;

    const open = window.state.tasks.filter(t=>t.status!=='done');
    const today = window.todayUTC();

    const overdue = open.filter(t => new Date(t.due) < today).sort((a,b)=> new Date(a.due)-new Date(b.due));
    const upcoming = open.filter(t => {
      const diff = Math.ceil((new Date(t.due) - today) / 86400000);
      return diff >= 0 && diff <= 7;
    }).sort((a,b)=> new Date(a.due)-new Date(b.due));

    const items = [
      ...overdue.map(t=>({ t, kind:'overdue', diff: Math.max(0, Math.floor((today - new Date(t.due)) / 86400000)) })),
      ...upcoming.map(t=>{
        const diff = Math.ceil((new Date(t.due) - today) / 86400000);
        return { t, kind: diff===0 ? 'today' : 'soon', diff };
      }),
    ];

    if(items.length===0){
      el.innerHTML = `<div class="empty">All clear — no overdue or upcoming deadlines in the next 7 days.</div>`;
      return;
    }

    el.innerHTML = items.map(({t, kind, diff})=>{
      const m = window.member(t.assigneeId);
      const p = window.project(t.projectId);
      const label = kind==='overdue' ? `${diff}d late` : kind==='today' ? 'Due today' : `in ${diff}d`;
      return `
        <div class="deadline-row ${kind}">
          <span class="deadline-dot ${kind}"></span>
          <div class="deadline-main">
            <div class="deadline-title">${window.escapeHTML(t.title)}</div>
            <div class="deadline-sub">
              <span class="ticket-id">${t.id}</span>
              <span>·</span>
              <span class="tag prio-${t.priority}">${t.priority}</span>
              <span>·</span>
              <span>${p ? window.escapeHTML(p.name) : 'No project'}</span>
              ${m ? `<span>·</span><span>${window.escapeHTML(m.name)}</span>` : ''}
            </div>
          </div>
          <span class="deadline-badge ${kind}">${label}</span>
        </div>`;
    }).join('');
  }

  function renderHealth(){
    const el = document.getElementById('dashHealth');
    if(!el) return;

    if(window.state.projects.length===0){
      el.innerHTML = `<div class="empty">No projects yet — create one from the Projects view.</div>`;
      return;
    }

    el.innerHTML = window.state.projects.map(p=>{
      const tasks = window.state.tasks.filter(t=>t.projectId===p.id);
      const done = tasks.filter(t=>t.status==='done').length;
      const pct = tasks.length ? Math.round(done/tasks.length*100) : 0;
      const overdueCount = tasks.filter(window.isOverdue).length;
      const inProgress = tasks.filter(t=>t.status==='progress' || t.status==='review').length;

      let flag = 'done', flagLabel = 'Done';
      if(tasks.length){
        if(overdueCount > 0){ flag='risk'; flagLabel = `${overdueCount} overdue`; }
        else if(pct >= 100){ flag='done'; flagLabel = 'Complete'; }
        else if(pct >= 50){ flag='good'; flagLabel = 'On track'; }
        else if(inProgress > 0 || pct > 0){ flag='warn'; flagLabel = 'In progress'; }
        else { flag='todo'; flagLabel = 'Not started'; }
      } else {
        flag='todo'; flagLabel = 'No tickets';
      }

      return `
        <div class="health-card">
          <div class="health-card-top">
            <span class="swatch-dot-sm" style="background:${p.color}"></span>
            <span class="health-name">${window.escapeHTML(p.name)}</span>
            <span class="health-flag ${flag}">${flagLabel}</span>
          </div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%; background:${p.color};"></div></div>
          <div class="health-meta">
            <span>${done}/${tasks.length} done</span>
            <span>${pct}%</span>
          </div>
        </div>`;
    }).join('');
  }
}
window.renderDashboard = renderDashboard;
