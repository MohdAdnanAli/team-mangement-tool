function _safeOpen(name, evtName, arg){
  if(typeof window[name] === 'function'){
    try{ arg!==undefined ? window[name](arg) : window[name](); }catch(e){ console.error(e); }
  } else {
    window.dispatchEvent(new CustomEvent(evtName, { detail: arg }));
  }
}
window.renderOneOnOnes = renderOneOnOnes;

function dimNote(dim){
  if(!dim) return '';
  const note = window.escapeHTML(dim.note || 'No note logged.');
  return `<div class="o3-scoreline"><span class="o3-score">${dim.score}/5</span><span>${note}</span></div>`;
}

function renderOneOnOnes(){
  const view = document.getElementById('view');
  const members = window.state.members || [];
  const focusId = window.state.o3Focus || (members[0] && members[0].id) || '';
  const m = window.member(focusId);
  const sessions = (window.state.oneOnOnes || []).filter(x => x.memberId === focusId);
  const allSessions = window.state.oneOnOnes || [];

  if(!members.length){
    view.innerHTML = `<div class="empty">Add a teammate first — 1:1s live on people, not on air.</div>`;
    return;
  }

  const counters = m ? window.memberCounters(m) : null;
  const pts = counters ? window.rewardPoints(counters) : 0;
  const grade = counters ? window.rewardGrade(pts) : { label:'', cls:'' };
  const signals = m ? window.memberSignals(m.id) : { meta:{} };

  view.innerHTML = `
    <div class="view-head">
      <div>
        <div class="view-title">One on one</div>
        <div class="view-sub">BEHAVIOUR · NATURE OF WORK · DEADLINE HANDLING · EXTRA</div>
      </div>
      <div class="view-actions">
        <button class="btn btn-primary" id="logO3Btn">+ Log 1:1</button>
      </div>
    </div>

    <div class="o3-people">
      ${members.map(person => {
        const c = window.memberCounters(person);
        const p = window.rewardPoints(c);
        const g = window.rewardGrade(p);
        const n = allSessions.filter(x => x.memberId === person.id).length;
        return `
          <button class="o3-person ${person.id===focusId?'active':''}" data-focus="${person.id}">
            <span class="o3-person-name">${window.escapeHTML(person.name)}</span>
            <span class="o3-person-meta">${n} 1:1s · ${p} pts</span>
            <span class="status-pill ${g.cls}">${g.label}</span>
          </button>`;
      }).join('')}
    </div>

    ${m ? `
    <div class="o3-dossier">
      <div class="o3-dossier-head">
        <div>
          <div class="member-name" style="font-size:18px;">${window.escapeHTML(m.name)}</div>
          <div class="member-role">${window.escapeHTML(m.role)} · ${m.capacity}h capacity</div>
        </div>
        <div class="rep-reward">
          <span class="rep-points">${pts}</span>
          <span class="rep-unit">reward pts</span>
          <span class="status-pill ${grade.cls}">${grade.label}</span>
        </div>
      </div>

      <div class="rep-counters o3-counters">
        ${(window.REP_KEYS || []).map(k => `
          <div class="rep-counter ${k.key}">
            <div class="rep-counter-label">${k.icon} ${k.label}</div>
            <div class="rep-counter-val">${counters[k.key]}</div>
            <div class="rep-counter-split">${k.hint}</div>
            <div class="rep-counter-split">${counters.manual[k.key]} logged · ${counters.auto[k.key]} from tickets / bills / 1:1s</div>
            <div class="rep-stepper" data-mem="${m.id}" data-key="${k.key}">
              <button type="button" data-bump="-1">−</button>
              <span>adjust</span>
              <button type="button" data-bump="1">+</button>
            </div>
          </div>`).join('')}
      </div>

      <div class="o3-signals">
        <div class="o3-signal"><b>${signals.meta.done || 0}</b> tickets done</div>
        <div class="o3-signal"><b>${signals.meta.overdue || 0}</b> overdue now</div>
        <div class="o3-signal"><b>${signals.meta.paid || 0}</b> bills paid</div>
        <div class="o3-signal"><b>${signals.meta.overdueBills || 0}</b> bills late</div>
        <div class="o3-signal"><b>${signals.meta.activeHrs || 0}h</b> still open</div>
        <div class="o3-signal"><b>${sessions.length}</b> 1:1s on file</div>
      </div>

      <div class="o3-timeline">
        ${sessions.length ? sessions.map(s => {
          const e = window.normalizeOneOnOne(s);
          const avg = window.oneOnOneAverage(e).toFixed(1);
          const tags = (e.extra.tags || []).map(t => `<span class="flag-pill">${window.escapeHTML(t)}</span>`).join('');
          return `
            <article class="o3-card">
              <div class="o3-card-head">
                <div>
                  <div class="o3-card-date">${window.fmtDate(e.date)}</div>
                  <div class="o3-card-avg">session avg ${avg} / 5</div>
                </div>
                <div class="card-actions">
                  <button class="icon-btn" data-edit-o3="${e.id}" title="Edit">✎</button>
                  <button class="icon-btn" data-del-o3="${e.id}" title="Delete">✕</button>
                </div>
              </div>
              <div class="o3-grid">
                <div><div class="o3-dim-label">Behaviour</div>${dimNote(e.behaviour)}</div>
                <div><div class="o3-dim-label">Nature of work</div>${dimNote(e.natureOfWork)}</div>
                <div><div class="o3-dim-label">Deadline handling</div>${dimNote(e.deadlineHandling)}</div>
                <div><div class="o3-dim-label">Extra</div>${dimNote(e.extra)}${tags ? `<div class="invoice-flags" style="margin:8px 0 0;">${tags}</div>` : ''}</div>
              </div>
              ${e.nextActions ? `<div class="invoice-notes"><b>Next:</b> ${window.escapeHTML(e.nextActions)}</div>` : ''}
            </article>`;
        }).join('') : `<div class="empty">No 1:1s for ${window.escapeHTML(m.name)} yet — log the first one while it is still specific.</div>`}
      </div>
    </div>` : ''}
  `;

  document.getElementById('logO3Btn').addEventListener('click', ()=>_safeOpen('openOneOnOneModal','open-o3-modal', { memberId: focusId }));
  document.querySelectorAll('[data-focus]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      window.state.o3Focus = btn.dataset.focus;
      renderOneOnOnes();
    });
  });
  document.querySelectorAll('.rep-stepper button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const wrap = btn.closest('.rep-stepper');
      window.bumpCounter(window.member(wrap.dataset.mem), wrap.dataset.key, Number(btn.dataset.bump));
      if(window.renderTicker) window.renderTicker();
      renderOneOnOnes();
    });
  });
  document.querySelectorAll('[data-edit-o3]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const row = (window.state.oneOnOnes || []).find(x => x.id === btn.dataset.editO3);
      _safeOpen('openOneOnOneModal','open-o3-modal', row);
    });
  });
  document.querySelectorAll('[data-del-o3]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if(!window.confirm('Delete this 1:1? Its score will no longer inform the reputation signals.')) return;
      window.removeOneOnOne(btn.dataset.delO3);
      window.renderNav(); window.renderTicker(); renderOneOnOnes();
    });
  });
}
