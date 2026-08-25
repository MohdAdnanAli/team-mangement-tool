export function renderKanban(){
  const view = document.getElementById('view');
  const projOptions = window.state.projects.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
  const memberOptions = window.state.members.map(m=>`<option value="${m.id}">${m.name}</option>`).join('');

  view.innerHTML = `
    <div class="view-head">
      <div>
        <div class="view-title">Kanban</div>
        <div class="view-sub">DRAG TICKETS BETWEEN COLUMNS</div>
      </div>
      <div class="view-actions">
        <select class="filter" id="filterProject"><option value="">All projects</option>${projOptions}</select>
        <select class="filter" id="filterMember"><option value="">All teammates</option>${memberOptions}</select>
        <select class="filter" id="filterLabel"><option value="">All labels</option></select>
        <button class="btn btn-primary" id="addTaskBtn">+ New ticket</button>
      </div>
    </div>
    <div class="kanban-board" id="kanbanBoard"></div>
  `;

  function _safeOpen(name, evtName, arg){ if(typeof window[name] === 'function'){ try{ if(arg!==undefined) window[name](arg); else window[name](); }catch(e){ console.error(e); }} else { window.dispatchEvent(new CustomEvent(evtName, { detail: arg })); } }
  document.getElementById('addTaskBtn').addEventListener('click', ()=>_safeOpen('openTaskModal','open-task-modal'));
  document.getElementById('filterProject').addEventListener('change', drawBoard);
  document.getElementById('filterMember').addEventListener('change', drawBoard);

  function drawBoard(){
    const fp = document.getElementById('filterProject').value;
    const fm = document.getElementById('filterMember').value;
    const fl = document.getElementById('filterLabel') ? document.getElementById('filterLabel').value : '';
    const filtered = window.state.tasks.filter(t => (!fp || t.projectId===fp) && (!fm || t.assigneeId===fm));
    const filteredByLabel = filtered.filter(t => {
      if(!fl) return true;
      try{
        const meta = typeof t.meta === 'string' ? JSON.parse(t.meta) : (t.meta || {});
        return Array.isArray(meta.labels) && meta.labels.includes(fl);
      }catch(e){ return false; }
    });
    const board = document.getElementById('kanbanBoard');
    board.innerHTML = window.STATUS_COLS.map(col=>{
      const tasks = filteredByLabel.filter(t=>t.status===col.key);
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

  // populate label filter with known labels
  updateLabelFilter();

  function updateLabelFilter(){
    const labelSelect = document.getElementById('filterLabel');
    if(!labelSelect) return;
    while(labelSelect.options.length>1) labelSelect.remove(1);
    const allLabels = new Set();
    window.state.tasks.forEach(t=>{
      try{ const meta = typeof t.meta === 'string' ? JSON.parse(t.meta) : (t.meta||{}); if(meta.labels && Array.isArray(meta.labels)) meta.labels.forEach(l=>allLabels.add(l)); }catch(e){}
    });
    Array.from(allLabels).forEach(l=>{ const opt = document.createElement('option'); opt.value = l; opt.textContent = l; labelSelect.appendChild(opt); });
    labelSelect.onchange = () => window.render();
  }

  function ticketHTML(t){
    const m = window.member(t.assigneeId);
    const p = window.project(t.projectId);
    const overdue = window.isOverdue(t);
    const labels = (t.meta && t.meta.labels) ? (Array.isArray(t.meta.labels) ? t.meta.labels : (typeof t.meta === 'string' ? (JSON.parse(t.meta).labels||[]) : [])) : [];
    const labelsHTML = labels.length ? labels.map(l=>`<span class="label-pill" style="background:${l}"></span>`).join('') : '';
    return `
      <div class="ticket" draggable="true" data-task="${t.id}">
        <div class="ticket-meta">
          <span class="ticket-id">${t.id}</span>
          <button class="ticket-del" data-del="${t.id}" title="Delete">✕</button>
        </div>
        <div class="ticket-title">${window.escapeHTML(t.title)}</div>
        <div style="margin-top:6px">${labelsHTML}</div>
        <div class="ticket-meta">
          <span class="tag prio-${t.priority}">${t.priority}</span>
          <span class="avatar" title="${m?m.name:'Unassigned'}">${m?window.initials(m.name):'—'}</span>
        </div>
        <div class="ticket-foot">
          <span><span class="proj-dot" style="background:${p?p.color:'#666'}"></span>${p?p.name:'—'}</span>
          <span class="due-chip ${overdue?'overdue':''}">${window.fmtDate(t.due)}</span>
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
      el.addEventListener('click', ()=> window.openCardModal(el.dataset.task));
    });
    document.querySelectorAll('[data-del]').forEach(btn=>{
      btn.addEventListener('click', e=>{
        e.stopPropagation();
        window.state.tasks = window.state.tasks.filter(t=>t.id!==btn.dataset.del);
        DB.remove('tasks', 'id', btn.dataset.del);
        window.renderNav(); window.renderTicker(); drawBoard();
        window.toast('Ticket removed');
      });
    });
    document.querySelectorAll('.kanban-col').forEach(col=>{
      col.addEventListener('dragover', e=>{ e.preventDefault(); col.classList.add('drag-over'); });
      col.addEventListener('dragleave', ()=> col.classList.remove('drag-over'));
      col.addEventListener('drop', e=>{
        e.preventDefault();
        col.classList.remove('drag-over');
        const taskId = e.dataTransfer.getData('text/plain');
        const t = window.state.tasks.find(t=>t.id===taskId);
        if(t){ t.status = col.dataset.col; DB.update('tasks', { status: t.status }, 'id', t.id); window.renderNav(); window.renderTicker(); drawBoard(); }
      });
    });
  }
}
