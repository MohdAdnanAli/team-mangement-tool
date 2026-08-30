function _safeOpen(name, evtName, arg){
  if(typeof window[name] === 'function'){
    try{ arg!==undefined ? window[name](arg) : window[name](); }catch(e){ console.error(e); }
  } else {
    window.dispatchEvent(new CustomEvent(evtName, { detail: arg }));
  }
}
window.renderTeam = renderTeam;

function counterStrip(m){
  const c = window.memberCounters(m);
  const pts = window.rewardPoints(c);
  const grade = window.rewardGrade(pts);
  const keys = window.REP_KEYS || [];
  return `
    <div class="rep-strip">
      <div class="rep-reward">
        <span class="rep-points">${pts}</span>
        <span class="rep-unit">pts</span>
        <span class="status-pill ${grade.cls}">${grade.label}</span>
      </div>
      <div class="rep-counters">
        ${keys.map(k => `
          <div class="rep-counter ${k.key}">
            <div class="rep-counter-label">${k.icon} ${k.label}</div>
            <div class="rep-counter-val">${c[k.key]}</div>
            <div class="rep-counter-split">${c.manual[k.key]} logged · ${c.auto[k.key]} from work</div>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderTeam(){
  const view = document.getElementById('view');
  const members = window.state.members || [];
  view.innerHTML = `
    <div class="view-head">
      <div>
        <div class="view-title">Team</div>
        <div class="view-sub">${members.length} MEMBERS · REPUTATION &amp; REWARDS</div>
      </div>
      <div class="view-actions">
        <button class="btn" id="openO3View">1:1 board →</button>
        <button class="btn btn-primary" id="addMemberBtn">+ Add teammate</button>
      </div>
    </div>
    <div class="team-grid team-grid-rich">
      ${members.map(m=>{
        const sessions = (window.state.oneOnOnes || []).filter(x => x.memberId === m.id);
        const last = sessions[0];
        const avg = last && window.oneOnOneAverage ? window.oneOnOneAverage(last).toFixed(1) : '—';
        return `
        <div class="member-card member-card-rich">
          <div class="member-card-main">
            <div class="member-avatar ${m.avatar ? 'has-image' : ''}">
              ${m.avatar ? `<img src="${window.escapeHTML(m.avatar)}" alt="${window.escapeHTML(m.name)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><span class="member-fallback" style="display:none;">${window.initials(m.name)}</span>` : `<span class="member-fallback">${window.initials(m.name)}</span>`}
            </div>
            <div class="member-body">
              <div class="card-top-row">
                <div class="member-name">${window.escapeHTML(m.name)}</div>
                <div class="card-actions">
                  <button class="icon-btn" data-edit-mem="${m.id}" title="Edit">✎</button>
                  <button class="icon-btn" data-del-mem="${m.id}" title="Delete">✕</button>
                </div>
              </div>
              <div class="member-role">${window.escapeHTML(m.role)}</div>
              <div class="member-cap">${m.capacity}h/week · ${sessions.length} one-on-ones · last avg ${avg}</div>
            </div>
          </div>
          ${counterStrip(m)}
          <div class="member-rep-actions">
            ${ (window.REP_KEYS || []).map(k => `
              <div class="rep-stepper" data-mem="${m.id}" data-key="${k.key}">
                <button type="button" data-bump="-1">−</button>
                <span>${k.label}</span>
                <button type="button" data-bump="1">+</button>
              </div>`).join('')}
          </div>
          <div class="member-foot-actions">
            <button class="btn btn-sm" data-log-o3="${m.id}">Log 1:1</button>
            <button class="btn btn-sm btn-primary" data-open-o3="${m.id}">Open dossier</button>
          </div>
        </div>`;
      }).join('') || '<div class="empty">No teammates yet</div>'}
    </div>
  `;

  document.getElementById('addMemberBtn').addEventListener('click', ()=>_safeOpen('openMemberModal','open-member-modal'));
  document.getElementById('openO3View').addEventListener('click', ()=>{
    window.state.view = 'oneonones';
    window.state.o3Focus = '';
    window.render();
  });
  document.querySelectorAll('[data-edit-mem]').forEach(btn=>{
    btn.addEventListener('click', ()=> _safeOpen('openMemberModal','open-member-modal', window.member(btn.dataset.editMem)));
  });
  document.querySelectorAll('[data-log-o3]').forEach(btn=>{
    btn.addEventListener('click', ()=> _safeOpen('openOneOnOneModal','open-o3-modal', { memberId: btn.dataset.logO3 }));
  });
  document.querySelectorAll('[data-open-o3]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      window.state.view = 'oneonones';
      window.state.o3Focus = btn.dataset.openO3;
      window.render();
    });
  });
  document.querySelectorAll('.rep-stepper button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const wrap = btn.closest('.rep-stepper');
      const m = window.member(wrap.dataset.mem);
      window.bumpCounter(m, wrap.dataset.key, Number(btn.dataset.bump));
      renderTeam();
      if(window.renderTicker) window.renderTicker();
    });
  });
  document.querySelectorAll('[data-del-mem]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const m = window.member(btn.dataset.delMem);
      if(!m) return;
      const linked = window.state.tasks.filter(t=>t.assigneeId===m.id).length;
      const msg = linked ? `Remove ${m.name}? ${linked} ticket(s) will become unassigned.` : `Remove ${m.name}?`;
      if(!window.confirm(msg)) return;
      window.state.tasks.forEach(t=>{ if(t.assigneeId===m.id){ t.assigneeId=''; DB.update('tasks', { assigneeId:'' }, 'id', t.id); } });
      (window.state.oneOnOnes || []).filter(x=>x.memberId===m.id).forEach(x => window.removeOneOnOne(x.id));
      window.state.members = window.state.members.filter(x=>x.id!==m.id);
      DB.remove('members', 'id', m.id);
      window.renderNav(); window.renderTicker(); renderTeam();
      window.toast('Teammate removed');
    });
  });
}
