export function renderWorkload(){
  const view = document.getElementById('view');
  view.innerHTML = `
    <div class="view-head">
      <div><div class="view-title">Workload</div><div class="view-sub">ACTIVE HOURS VS WEEKLY CAPACITY</div></div>
    </div>
    <div class="panel">
      ${window.state.members.map(m=>{
        const hrs = window.state.tasks.filter(t=>t.assigneeId===m.id && t.status!=='done').reduce((a,t)=>a+t.hours,0);
        const pct = Math.min(100, Math.round((hrs/m.capacity)*100));
        const color = pct>95 ? 'var(--danger)' : pct>70 ? 'var(--amber)' : 'var(--teal)';
        const activeTasks = window.state.tasks.filter(t=>t.assigneeId===m.id && t.status!=='done').length;
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
