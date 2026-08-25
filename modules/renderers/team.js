export function renderTeam(){
  const view = document.getElementById('view');
  view.innerHTML = `
    <div class="view-head">
      <div><div class="view-title">Team</div><div class="view-sub">${window.state.members.length} MEMBERS</div></div>
      <div class="view-actions"><button class="btn btn-primary" id="addMemberBtn">+ Add teammate</button></div>
    </div>
    <div class="team-grid">
      ${window.state.members.map(m=>`
        <div class="member-card">
          <div class="member-avatar">${window.initials(m.name)}</div>
          <div class="member-body">
            <div class="card-top-row">
              <div class="member-name">${window.escapeHTML(m.name)}</div>
              <div class="card-actions">
                <button class="icon-btn" data-edit-mem="${m.id}" title="Edit">✎</button>
                <button class="icon-btn" data-del-mem="${m.id}" title="Delete">✕</button>
              </div>
            </div>
            <div class="member-role">${window.escapeHTML(m.role)}</div>
            <div class="member-cap">${m.capacity}h/week capacity</div>
          </div>
        </div>`).join('') || '<div class="empty">No teammates yet</div>'}
    </div>
  `;
    function _safeOpen(name, evtName, arg){ if(typeof window[name] === 'function'){ try{ if(arg!==undefined) window[name](arg); else window[name](); }catch(e){ console.error(e); }} else { window.dispatchEvent(new CustomEvent(evtName, { detail: arg })); } }
    document.getElementById('addMemberBtn').addEventListener('click', ()=>_safeOpen('openMemberModal','open-member-modal'));
    document.querySelectorAll('[data-edit-mem]').forEach(btn=>{
      btn.addEventListener('click', ()=> _safeOpen('openMemberModal','open-member-modal', window.member(btn.dataset.editMem)));
    });
  document.querySelectorAll('[data-del-mem]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const m = window.member(btn.dataset.delMem);
      if(!m) return;
      const linked = window.state.tasks.filter(t=>t.assigneeId===m.id).length;
      const msg = linked ? `Remove ${m.name}? ${linked} ticket(s) will become unassigned.` : `Remove ${m.name}?`;
      if(!window.confirm(msg)) return;
      window.state.tasks.forEach(t=>{ if(t.assigneeId===m.id){ t.assigneeId=''; DB.update('tasks', { assigneeId:'' }, 'id', t.id); } });
      window.state.members = window.state.members.filter(x=>x.id!==m.id);
      DB.remove('members', 'id', m.id);
      window.renderNav(); window.renderTicker(); renderTeam();
      window.toast('Teammate removed');
    });
  });
}
