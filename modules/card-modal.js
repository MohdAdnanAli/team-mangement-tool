(function(){
  // Expose openCardModal globally
  window.openCardModal = function(taskId){
    const t = state.tasks.find(x=>x.id===taskId);
    if(!t) return;
    let meta = t.meta || {};
    try{ meta = typeof meta === 'string' ? JSON.parse(meta) : meta; }catch(e){ meta = meta || {}; }
    meta.description = meta.description || '';
    meta.labels = Array.isArray(meta.labels) ? meta.labels : [];
    meta.checklist = Array.isArray(meta.checklist) ? meta.checklist : [];

    const labelPalette = ['#F2B84B','#4FD1C5','#8AA4FF','#E8656A','#C792EA','#E6E6E6'];

    function renderChecklistHTML(){
      if(!meta.checklist || meta.checklist.length===0) return '<div class="empty">No checklist items</div>';
      return meta.checklist.map((c,i)=>`
        <div class="field" style="display:flex;gap:8px;align-items:center;">
          <input type="checkbox" data-chk-index="${i}" ${c.done? 'checked':''}>
          <input class="chk-text" value="${escapeHTML(c.text)}" style="flex:1">
          <button class="btn btn-sm line-item-del" data-remove-chk="${i}">×</button>
        </div>`).join('');
    }

    openModal(`
      <div class="modal-title">${escapeHTML(t.title)}</div>
      <div class="field"><label>Description</label><textarea id="cardDesc" rows="4">${escapeHTML(meta.description)}</textarea></div>
      <div class="row2">
        <div class="field"><label>Project</label><select id="cardProject">${state.projects.map(p=>`<option value="${p.id}" ${p.id===t.projectId?'selected':''}>${escapeHTML(p.name)}</option>`).join('')}</select></div>
        <div class="field"><label>Assignee</label><select id="cardMember">${state.members.map(m=>`<option value="${m.id}" ${m.id===t.assigneeId?'selected':''}>${escapeHTML(m.name)}</option>`).join('')}</select></div>
      </div>
      <div class="row2">
        <div class="field"><label>Due date</label><input id="cardDue" type="date" value="${t.due}"></div>
        <div class="field"><label>Priority</label><select id="cardPrio"><option value="low" ${t.priority==='low'?'selected':''}>Low</option><option value="med" ${t.priority==='med'?'selected':''}>Medium</option><option value="high" ${t.priority==='high'?'selected':''}>High</option></select></div>
      </div>
      <div class="field"><label>Labels</label>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${labelPalette.map(c=>`<button class="btn" data-label-color="${c}" style="background:${c};border-color:${c};"> </button>`).join('')}
          </div>
          <div style="display:flex;gap:8px;margin-top:8px;align-items:center;">
            <input id="newLabelColor" type="color" value="#F2B84B" style="width:44px;height:32px;padding:0;border-radius:6px;border:1px solid var(--border);">
            <input id="newLabelText" placeholder="Label name (optional)" style="flex:1;padding:8px 10px;">
            <button class="btn btn-primary" id="addLabelBtn">Add</button>
          </div>
          <div id="cardLabels" style="margin-top:8px">${meta.labels.map(l=>`<span class="label-pill" style="background:${l}"></span>`).join('')}</div>
      </div>

      <div class="field"><label>Checklist</label>
        <div id="cardChecklist">${renderChecklistHTML()}</div>
        <div style="display:flex;gap:8px;margin-top:8px;">
          <input id="newChk" placeholder="Add checklist item" style="flex:1">
          <button class="btn btn-primary" id="addChkBtn">Add</button>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn btn-ghost" id="cancelBtn">Cancel</button>
        <button class="btn btn-primary" id="saveCardBtn">Save</button>
      </div>
    `);

    document.getElementById('cancelBtn').addEventListener('click', closeModal);

    document.querySelectorAll('[data-label-color]').forEach(b=>{
      b.addEventListener('click', ()=>{
        const col = b.dataset.labelColor;
        meta.labels = meta.labels || [];
        if(meta.labels.includes(col)) meta.labels = meta.labels.filter(x=>x!==col);
        else meta.labels.push(col);
        document.getElementById('cardLabels').innerHTML = meta.labels.map(l=>`<span class="label-pill" style="background:${l}"></span>`).join('');
        if(window.updateLabelFilter) window.updateLabelFilter();
      });
    });

    document.getElementById('addLabelBtn').addEventListener('click', ()=>{
      const color = document.getElementById('newLabelColor').value;
      if(!color) return;
      meta.labels = meta.labels || [];
      if(!meta.labels.includes(color)) meta.labels.push(color);
      document.getElementById('cardLabels').innerHTML = meta.labels.map(l=>`<span class="label-pill" style="background:${l}"></span>`).join('');
      document.getElementById('newLabelText').value = '';
      if(window.updateLabelFilter) window.updateLabelFilter();
    });

    function refreshChecklist(){
      const el = document.getElementById('cardChecklist');
      if(!meta.checklist || meta.checklist.length===0){ el.innerHTML = '<div class="empty">No checklist items</div>'; return; }
      el.innerHTML = meta.checklist.map((c,i)=>`
        <div class="field" style="display:flex;gap:8px;align-items:center;">
          <input type="checkbox" data-chk-index="${i}" ${c.done? 'checked':''}>
          <input class="chk-text" value="${escapeHTML(c.text)}" style="flex:1">
          <button class="btn btn-sm line-item-del" data-remove-chk="${i}">×</button>
        </div>`).join('');
      el.querySelectorAll('[data-chk-index]').forEach(cb=>{
        cb.addEventListener('change', ()=>{
          const idx = Number(cb.dataset.chkIndex); meta.checklist[idx].done = cb.checked;
        });
      });
      el.querySelectorAll('[data-remove-chk]').forEach(btn=>{
        btn.addEventListener('click', ()=>{
          const idx = Number(btn.dataset.removeChk); meta.checklist.splice(idx,1); refreshChecklist();
        });
      });
      el.querySelectorAll('.chk-text').forEach((inp,i)=>{
        inp.addEventListener('input', ()=> meta.checklist[i].text = inp.value);
      });
    }

    refreshChecklist();

    document.getElementById('addChkBtn').addEventListener('click', ()=>{
      const v = document.getElementById('newChk').value.trim(); if(!v) return; meta.checklist = meta.checklist || []; meta.checklist.push({ text: v, done: false }); document.getElementById('newChk').value = ''; refreshChecklist();
    });

    document.getElementById('saveCardBtn').addEventListener('click', ()=>{
      t.title = document.querySelector('.modal-title').textContent || t.title;
      t.projectId = document.getElementById('cardProject').value;
      t.assigneeId = document.getElementById('cardMember').value;
      t.due = document.getElementById('cardDue').value || t.due;
      t.priority = document.getElementById('cardPrio').value;
      meta.description = document.getElementById('cardDesc').value || '';
      t.meta = meta;
      try{ DB.update('tasks', { title: t.title, projectId: t.projectId, assigneeId: t.assigneeId, status: t.status, priority: t.priority, due: t.due, hours: t.hours, meta: JSON.stringify(meta) }, 'id', t.id); }catch(e){ console.warn('DB update failed', e); }
      if(window.updateLabelFilter) window.updateLabelFilter();
      closeModal(); renderNav(); renderTicker(); render();
      toast('Ticket updated');
    });
  };
})();
