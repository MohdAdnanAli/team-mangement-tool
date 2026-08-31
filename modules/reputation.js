const REP_KEYS = [
  { key:'serious', label:'Follow-through', hint:'Clear ownership and dependable delivery', icon:'🏅' },
  { key:'procrastinations', label:'Support to unblock', hint:'Work that needs context, help, or a revised plan', icon:'🧭' },
  { key:'dealings', label:'Teamwork', hint:'Clear communication and dependable work with others', icon:'🤝' },
  { key:'extra', label:'Above & beyond', hint:'Initiative, mentoring, unblocking, and quality improvements', icon:'✨' },
];

const O3_DIMS = [
  { key:'behaviour', label:'Working approach', hint:'Communication, ownership, and how work moves forward' },
  { key:'natureOfWork', label:'Work quality & fit', hint:'Quality, craft, and whether the work fits the role' },
  { key:'deadlineHandling', label:'Delivery confidence', hint:'Deadline awareness, risk signalling, and follow-through' },
  { key:'extra', label:'Additional contribution', hint:'Useful work beyond the core task or role' },
];

const EXTRA_TAGS = [
  { key:'ownership', label:'Clear ownership' },
  { key:'communication', label:'Clear updates' },
  { key:'initiative', label:'Initiative' },
  { key:'mentoring', label:'Mentoring' },
  { key:'unblocking', label:'Unblocking' },
  { key:'quality', label:'Quality improvement' },
  { key:'scope-creep', label:'Scope risk' },
  { key:'silence', label:'Support needed' },
];

function emptyStats(){
  return { serious:0, procrastinations:0, dealings:0, extra:0 };
}

function normalizeStats(raw){
  const s = emptyStats();
  let obj = raw;
  if(typeof raw === 'string' && raw.trim()){
    try{ obj = JSON.parse(raw); }catch(_e){ obj = {}; }
  }
  if(!obj || typeof obj !== 'object') return s;
  for(const { key } of REP_KEYS){
    const n = parseInt(obj[key], 10);
    s[key] = Number.isFinite(n) ? Math.max(0, n) : 0;
  }
  return s;
}

function memberSignals(memberId){
  const tasks = (window.state.tasks || []).filter(t => t.assigneeId === memberId);
  const bills = (window.state.bills || []).filter(b => b.memberId === memberId);
  const o3 = (window.state.oneOnOnes || []).filter(x => x.memberId === memberId);
  const m = window.member(memberId);
  const today = window.todayUTC ? window.todayUTC() : new Date();

  const done = tasks.filter(t => t.status === 'done');
  const overdue = tasks.filter(t => window.isOverdue && window.isOverdue(t)).length;
  const highDone = done.filter(t => t.priority === 'high').length;
  const activeHrs = tasks.filter(t => t.status !== 'done').reduce((a,t)=> a + (Number(t.hours)||0), 0);
  const stretch = m ? Math.max(0, Math.round((activeHrs - m.capacity) / 4)) : 0;

  const paid = bills.filter(b => b.status === 'paid').length;
  const overdueBills = bills.filter(b => b.status === 'overdue' || (b.status === 'sent' && b.dueDate && new Date(b.dueDate) < today)).length;

  const o3Scores = o3.map(normalizeOneOnOne);
  const strongBehaviour = o3Scores.filter(x => x.behaviour.score >= 4).length;
  const weakBehaviour = o3Scores.filter(x => x.behaviour.score <= 2).length;
  const strongNature = o3Scores.filter(x => x.natureOfWork.score >= 4).length;
  const strongDeadline = o3Scores.filter(x => x.deadlineHandling.score >= 4).length;
  const weakDeadline = o3Scores.filter(x => x.deadlineHandling.score <= 2).length;
  const strongExtra = o3Scores.filter(x => x.extra.score >= 4).length;

  return {
    serious: done.length + highDone + strongBehaviour + strongNature + strongDeadline,
    procrastinations: overdue + weakBehaviour + weakDeadline,
    dealings: paid + Math.max(0, paid - overdueBills),
    extra: stretch + highDone + strongExtra,
    meta: { done: done.length, overdue, paid, overdueBills, o3: o3.length, activeHrs },
  };
}

function memberCounters(member){
  const man = normalizeStats(member && member.stats);
  const auto = memberSignals(member && member.id);
  return {
    serious: man.serious + auto.serious,
    procrastinations: man.procrastinations + auto.procrastinations,
    dealings: man.dealings + auto.dealings,
    extra: man.extra + auto.extra,
    manual: man,
    auto,
  };
}

function rewardPoints(counters){
  const c = counters || emptyStats();
  return (
    c.serious * 10 +
    c.dealings * 8 +
    c.extra * 6 -
    c.procrastinations * 12
  );
}

function rewardGrade(points){
  if(points >= 90) return { label:'Strong momentum', cls:'success', band:'A', icon:'🏆' };
  if(points >= 60) return { label:'Steady progress', cls:'teal', band:'B', icon:'⭐' };
  if(points >= 30) return { label:'Building rhythm', cls:'amber', band:'C', icon:'🌱' };
  return { label:'Support focus', cls:'danger', band:'D', icon:'🧭' };
}

function persistMemberStats(member){
  if(!member) return;
  member.stats = normalizeStats(member.stats);
  if(window.DB && window.DB.update){
    window.DB.update('members', { stats: JSON.stringify(member.stats) }, 'id', member.id);
  }
}

function bumpCounter(member, key, delta){
  if(!member || !REP_KEYS.some(k => k.key === key)) return;
  member.stats = normalizeStats(member.stats);
  member.stats[key] = Math.max(0, (member.stats[key] || 0) + delta);
  persistMemberStats(member);
}

function emptyOneOnOne(memberId){
  const dims = {};
  for(const d of O3_DIMS){
    dims[d.key] = { score: 3, note: '' };
  }
  dims.extra.tags = [];
  return {
    id: '',
    memberId: memberId || '',
    date: window.todayStr ? window.todayStr() : new Date().toISOString().slice(0,10),
    behaviour: dims.behaviour,
    natureOfWork: dims.natureOfWork,
    deadlineHandling: dims.deadlineHandling,
    extra: dims.extra,
    nextActions: '',
    applyCounters: true,
  };
}

function normalizeOneOnOne(raw){
  const base = emptyOneOnOne(raw && raw.memberId);
  if(!raw) return base;
  let extraTags = raw.extraTags;
  if(typeof extraTags === 'string'){
    try{ extraTags = JSON.parse(extraTags); }catch(_e){ extraTags = []; }
  }
  const dim = (key, scoreKey, noteKey) => ({
    score: Math.min(5, Math.max(1, parseInt(raw[scoreKey] != null ? raw[scoreKey] : (raw[key] && raw[key].score), 10) || 3)),
    note: String((raw[noteKey] != null ? raw[noteKey] : (raw[key] && raw[key].note)) || ''),
  });
  return {
    id: raw.id || '',
    memberId: raw.memberId || '',
    date: raw.date || base.date,
    behaviour: dim('behaviour', 'behaviourScore', 'behaviourNote'),
    natureOfWork: dim('natureOfWork', 'natureScore', 'natureNote'),
    deadlineHandling: dim('deadlineHandling', 'deadlineScore', 'deadlineNote'),
    extra: { ...dim('extra', 'extraScore', 'extraNote'), tags: Array.isArray(extraTags) ? extraTags : (raw.extra && raw.extra.tags) || [] },
    nextActions: String(raw.nextActions || ''),
    applyCounters: raw.applyCounters !== 0 && raw.applyCounters !== false,
  };
}

function oneOnOneAverage(entry){
  const e = normalizeOneOnOne(entry);
  return (e.behaviour.score + e.natureOfWork.score + e.deadlineHandling.score + e.extra.score) / 4;
}

function flattenOneOnOne(entry){
  const e = normalizeOneOnOne(entry);
  return {
    id: e.id,
    memberId: e.memberId,
    date: e.date,
    behaviourScore: e.behaviour.score,
    behaviourNote: e.behaviour.note,
    natureScore: e.natureOfWork.score,
    natureNote: e.natureOfWork.note,
    deadlineScore: e.deadlineHandling.score,
    deadlineNote: e.deadlineHandling.note,
    extraScore: e.extra.score,
    extraNote: e.extra.note,
    extraTags: JSON.stringify(e.extra.tags || []),
    nextActions: e.nextActions,
  };
}

function saveOneOnOne(entry){
  const flat = flattenOneOnOne(entry);
  if(!flat.id) flat.id = 'o3-' + Math.random().toString(36).slice(2, 8);
  const live = normalizeOneOnOne({ ...entry, id: flat.id });
  const list = window.state.oneOnOnes || (window.state.oneOnOnes = []);
  const idx = list.findIndex(x => x.id === live.id);
  if(idx >= 0) list[idx] = live;
  else list.unshift(live);

    if(window.DB){
      const row = flattenOneOnOne(live);
      const { id, ...rest } = row;
      const existing = window.DB.queryOne && window.DB.queryOne('SELECT id FROM one_on_ones WHERE id=?', [id]);
      if(existing) window.DB.update('one_on_ones', rest, 'id', id);
      else window.DB.insert('one_on_ones', row);
    }

  return live;
}

function removeOneOnOne(id){
  window.state.oneOnOnes = (window.state.oneOnOnes || []).filter(x => x.id !== id);
  if(window.DB) window.DB.remove('one_on_ones', 'id', id);
}

function openOneOnOneModal(existing, memberId){
  if(existing && existing.memberId && !existing.id && !existing.behaviour){
    memberId = existing.memberId;
    existing = null;
  }
  const mId = (existing && existing.memberId) || memberId || (window.state.members[0] && window.state.members[0].id) || '';
  const data = existing ? normalizeOneOnOne(existing) : emptyOneOnOne(mId);
  const memberOptions = (window.state.members || []).map(m =>
    `<option value="${m.id}" ${m.id===data.memberId?'selected':''}>${window.escapeHTML(m.name)}</option>`
  ).join('');

  const scorePips = (name, val) => `
    <div class="score-pips" data-score-name="${name}">
      ${[1,2,3,4,5].map(n => `<button type="button" class="score-pip ${n<=val?'on':''}" data-score="${n}">${n}</button>`).join('')}
      <input type="hidden" id="o3-${name}" value="${val}">
    </div>`;

  const dimBlock = (key, label, hint, dim) => `
    <div class="o3-dim">
      <div class="o3-dim-head">
        <div>
          <div class="o3-dim-label">${label}</div>
          <div class="o3-dim-hint">${hint}</div>
        </div>
        ${scorePips(key, dim.score)}
      </div>
      <textarea id="o3-note-${key}" rows="3" placeholder="Add a short work-based example or observation.">${window.escapeHTML(dim.note || '')}</textarea>
    </div>`;

  window.openModal(`
    <div class="modal-title">${existing ? 'Edit growth check-in' : 'Start a growth check-in'}</div>
    <div class="o3-welcome">✨ Recognise a specific win, name any support needed, and agree one next step.</div>
    <div class="row2">
      <div class="field"><label>Teammate</label><select id="o3Member">${memberOptions}</select></div>
      <div class="field"><label>Date</label><input id="o3Date" type="date" value="${data.date}"></div>
    </div>
    ${O3_DIMS.map(d => dimBlock(d.key, d.label, d.hint, data[d.key])).join('')}
    <div class="field">
      <label>Focus tags</label>
      <div class="color-swatches" id="o3Tags">
        ${EXTRA_TAGS.map(t => {
          const on = (data.extra.tags || []).includes(t.key);
          return `<label class="color-swatch-opt ${on?'selected':''}">
            <input type="checkbox" class="o3-tag" value="${t.key}" ${on?'checked':''}>
            <span class="swatch-hex">${t.label}</span>
          </label>`;
        }).join('')}
      </div>
    </div>
    <div class="field"><label>Next actions</label><textarea id="o3Next" rows="2" placeholder="Agree one or two clear actions for the next check-in.">${window.escapeHTML(data.nextActions || '')}</textarea></div>
    <div class="o3-apply">Scores are conversation prompts, not a ranking. Keep notes specific and use them to make support and recognition visible.</div>
    <div class="modal-actions">
      <button class="btn btn-ghost" id="cancelBtn">Cancel</button>
      <button class="btn btn-primary" id="saveO3Btn">${existing ? 'Save check-in' : 'Save growth check-in'}</button>
    </div>
  `);

  const modal = document.querySelector('.modal');
  if(modal) modal.style.maxWidth = '560px';

  document.querySelectorAll('.score-pips').forEach(group => {
    group.addEventListener('click', e => {
      const pip = e.target.closest('.score-pip');
      if(!pip) return;
      const n = Number(pip.dataset.score);
      group.querySelectorAll('.score-pip').forEach(p => p.classList.toggle('on', Number(p.dataset.score) <= n));
      group.querySelector('input').value = n;
    });
  });
  document.querySelectorAll('#o3Tags .color-swatch-opt').forEach(el => {
    el.addEventListener('click', function(ev){
      ev.preventDefault();
      const box = this.querySelector('input');
      box.checked = !box.checked;
      this.classList.toggle('selected', box.checked);
    });
  });
  document.getElementById('cancelBtn').addEventListener('click', window.closeModal);
  document.getElementById('saveO3Btn').addEventListener('click', () => {
    const memberId = document.getElementById('o3Member').value;
    if(!memberId){ window.toast('Pick a teammate'); return; }
    const readDim = (key) => ({
      score: parseInt(document.getElementById('o3-' + key).value, 10) || 3,
      note: document.getElementById('o3-note-' + key).value.trim(),
    });
    const extra = readDim('extra');
    extra.tags = Array.from(document.querySelectorAll('.o3-tag:checked')).map(i => i.value);
    saveOneOnOne({
      id: existing ? existing.id : '',
      memberId,
      date: document.getElementById('o3Date').value || (window.todayStr && window.todayStr()),
      behaviour: readDim('behaviour'),
      natureOfWork: readDim('natureOfWork'),
      deadlineHandling: readDim('deadlineHandling'),
      extra,
      nextActions: document.getElementById('o3Next').value.trim(),
    });
    window.closeModal();
    if(window.renderNav) window.renderNav();
    if(window.renderTicker) window.renderTicker();
    if(window.render) window.render();
    window.toast(existing ? 'Growth check-in updated' : 'Growth check-in saved');
  });
}
Object.assign(window,{REP_KEYS,O3_DIMS,EXTRA_TAGS,emptyStats,normalizeStats,memberSignals,memberCounters,rewardPoints,rewardGrade,persistMemberStats,bumpCounter,emptyOneOnOne,normalizeOneOnOne,oneOnOneAverage,flattenOneOnOne,saveOneOnOne,removeOneOnOne,openOneOnOneModal});
