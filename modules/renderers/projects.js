export function renderProjects(){
  const view = document.getElementById('view');
  view.innerHTML = `
    <div class="view-head">
      <div><div class="view-title">Projects</div><div class="view-sub">${window.state.projects.length} ACTIVE</div></div>
      <div class="view-actions"><button class="btn btn-primary" id="addProjBtn">+ New project</button></div>
    </div>
    <div class="proj-grid">
      ${window.state.projects.map(p=>{
        const tasks = window.state.tasks.filter(t=>t.projectId===p.id);
        const done = tasks.filter(t=>t.status==='done').length;
        return `
        <div class="proj-card" style="--accent:${p.color}">
          <div class="card-top-row">
            <div class="proj-card-name">${window.escapeHTML(p.name)}</div>
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
  function _safeOpen(name, evtName, arg){ if(typeof window[name] === 'function'){ try{ if(arg!==undefined) window[name](arg); else window[name](); }catch(e){ console.error(e); }} else { window.dispatchEvent(new CustomEvent(evtName, { detail: arg })); } }
  document.getElementById('addProjBtn').addEventListener('click', ()=>_safeOpen('openProjectModal','open-project-modal'));
  document.querySelectorAll('[data-edit-proj]').forEach(btn=>{
    btn.addEventListener('click', ()=> _safeOpen('openProjectModal','open-project-modal', window.project(btn.dataset.editProj)));
  });
  document.querySelectorAll('[data-del-proj]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const p = window.project(btn.dataset.delProj);
      if(!p) return;
      const linked = window.state.tasks.filter(t=>t.projectId===p.id).length;
      const msg = linked ? `Delete "${p.name}"? ${linked} ticket(s) will become unassigned from a project.` : `Delete "${p.name}"?`;
      if(!window.confirm(msg)) return;
      window.state.tasks.forEach(t=>{ if(t.projectId===p.id){ t.projectId=''; DB.update('tasks', { projectId:'' }, 'id', t.id); } });
      window.state.projects = window.state.projects.filter(x=>x.id!==p.id);
      DB.remove('projects', 'id', p.id);
      window.renderNav(); window.renderTicker(); renderProjects();
      window.toast('Project deleted');
    });
  });
}
