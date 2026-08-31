/* First live-data checkpoint. Local SQLite remains the fallback until an
 * authenticated workspace has data. Importing requires an explicit user click. */
(function initialiseSupabaseSync(){
  const client = () => window.supabaseClient;
  const workspaceId = () => window.SUPABASE_WORKSPACE_ID;

  function fail(error){
    if(error) throw error;
  }
  function toTask(row){ return { ...row, projectId:row.project_id || '', assigneeId:row.assignee_id || '', meta:row.meta || {} }; }
  function toBill(row, items){ return { ...row, memberId:row.member_id || '', billNumber:row.bill_number || '', periodStart:row.period_start || '', periodEnd:row.period_end || '', taxRate:Number(row.tax_rate || 0), issueDate:row.issue_date || '', dueDate:row.due_date || '', lineItems:items || [] }; }
  function toAgreement(row){ return { ...row, dateAgreed:row.date_agreed || '' }; }
  function toCheckin(row){ return window.normalizeOneOnOne({ ...row, memberId:row.member_id, behaviourScore:row.behaviour_score, behaviourNote:row.behaviour_note, natureScore:row.nature_score, natureNote:row.nature_note, deadlineScore:row.deadline_score, deadlineNote:row.deadline_note, extraScore:row.extra_score, extraNote:row.extra_note, extraTags:row.extra_tags, nextActions:row.next_actions }); }

  async function loadRemoteState(state){
    const db = client(), ws = workspaceId();
    const [members, projects, tasks, bills, agreements, checkins] = await Promise.all([
      db.from('members').select('*').eq('workspace_id', ws).order('id'),
      db.from('projects').select('*').eq('workspace_id', ws).order('id'),
      db.from('tasks').select('*').eq('workspace_id', ws).order('id'),
      db.from('bills').select('*').eq('workspace_id', ws).order('id'),
      db.from('agreements').select('*').eq('workspace_id', ws).order('id'),
      db.from('checkins').select('*').eq('workspace_id', ws).order('date', { ascending:false }),
    ]);
    [members, projects, tasks, bills, agreements, checkins].forEach(result => fail(result.error));
    if(!members.data.length) return false;
    const billIds = bills.data.map(b => b.id);
    const lineItems = billIds.length ? await db.from('line_items').select('*').in('bill_id', billIds) : { data:[], error:null };
    fail(lineItems.error);
    const itemsByBill = new Map();
    lineItems.data.forEach(item => { const list=itemsByBill.get(item.bill_id)||[]; list.push({description:item.description,hours:Number(item.hours),rate:Number(item.rate)}); itemsByBill.set(item.bill_id,list); });
    state.members = members.data.map(({workspace_id,created_at,updated_at,created_by,...row}) => ({...row, stats:row.stats || {}}));
    state.projects = projects.data.map(({workspace_id,created_at,updated_at,created_by,...row}) => row);
    state.tasks = tasks.data.map(({workspace_id,created_at,updated_at,created_by,...row}) => toTask(row));
    state.bills = bills.data.map(({workspace_id,created_at,updated_at,created_by,...row}) => toBill(row,itemsByBill.get(row.id)));
    state.agreements = agreements.data.map(({workspace_id,created_at,updated_at,created_by,...row}) => toAgreement(row));
    state.oneOnOnes = checkins.data.map(({workspace_id,created_at,updated_at,created_by,...row}) => toCheckin(row));
    state.taskSeq = Math.max(0,...state.tasks.map(t => Number(String(t.id).replace(/\D/g,'')) || 0));
    state.billSeq = Math.max(0,...state.bills.map(b => Number(String(b.billNumber).replace(/\D/g,'')) || 0));
    window.DATA_MODE = 'supabase';
    return true;
  }

  function localRows(state){
    const ws=workspaceId();
    return {
      members:(state.members||[]).map(m=>({id:m.id,workspace_id:ws,name:m.name,role:m.role||'',capacity:Number(m.capacity)||0,avatar:m.avatar||'',stats:m.stats||{}})),
      projects:(state.projects||[]).map(p=>({id:p.id,workspace_id:ws,name:p.name,color:p.color||'#4FD1C5'})),
      tasks:(state.tasks||[]).map(t=>({id:t.id,workspace_id:ws,title:t.title,project_id:t.projectId||null,assignee_id:t.assigneeId||null,status:t.status,priority:t.priority,due:t.due||null,hours:Number(t.hours)||0,meta:typeof t.meta==='string'?JSON.parse(t.meta||'{}'):t.meta||{}})),
      bills:(state.bills||[]).map(b=>({id:b.id,workspace_id:ws,member_id:b.memberId||null,bill_number:b.billNumber,period_start:b.periodStart||null,period_end:b.periodEnd||null,flags:b.flags||[],tax_rate:Number(b.taxRate)||0,issue_date:b.issueDate||null,due_date:b.dueDate||null,status:b.status,notes:b.notes||'',party:b.party||''})),
      agreements:(state.agreements||[]).map(a=>({id:a.id,workspace_id:ws,title:a.title,party:a.party||'',amount:a.amount||'',status:a.status,date_agreed:a.dateAgreed||null,terms:a.terms||''})),
      checkins:(state.oneOnOnes||[]).map(raw=>{const e=window.flattenOneOnOne(raw);return {id:e.id,workspace_id:ws,member_id:e.memberId,date:e.date,behaviour_score:e.behaviourScore,behaviour_note:e.behaviourNote,nature_score:e.natureScore,nature_note:e.natureNote,deadline_score:e.deadlineScore,deadline_note:e.deadlineNote,extra_score:e.extraScore,extra_note:e.extraNote,extra_tags:JSON.parse(e.extraTags||'[]'),next_actions:e.nextActions};}),
      lineItems:(state.bills||[]).flatMap(b=>(b.lineItems||[]).map(i=>({bill_id:b.id,description:i.description||'',hours:Number(i.hours)||0,rate:Number(i.rate)||0}))),
    };
  }

  async function importLocalState(state){
    const db=client(), rows=localRows(state);
    for(const table of ['members','projects','tasks','bills','agreements','checkins']){
      if(!rows[table].length) continue;
      const result=await db.from(table).upsert(rows[table]); fail(result.error);
    }
    if(rows.lineItems.length){
      const deleted=await db.from('line_items').delete().in('bill_id',rows.bills.map(b=>b.id)); fail(deleted.error);
      const inserted=await db.from('line_items').insert(rows.lineItems); fail(inserted.error);
    }
  }

  function openImportPrompt(state){
    window.openModal(`
      <div class="modal-title">Import local workspace?</div>
      <p class="modal-copy">Your Supabase workspace is empty. Import the current local members, projects, tasks, check-ins, invoices, and agreements now?</p>
      <div class="o3-apply">This is a one-time upload to the shared DarkMatter Labs workspace. It will not delete your local backup.</div>
      <div class="modal-actions"><button class="btn btn-ghost" id="stayLocalBtn">Keep local for now</button><button class="btn btn-primary" id="importLocalBtn">Import to shared workspace</button></div>`);
    document.getElementById('stayLocalBtn').addEventListener('click',window.closeModal);
    document.getElementById('importLocalBtn').addEventListener('click',async()=>{
      const button=document.getElementById('importLocalBtn'); button.disabled=true; button.textContent='Importing…';
      try{ await importLocalState(state); await loadRemoteState(state); window.closeModal(); window.render(); window.toast('Workspace imported to Supabase'); }
      catch(error){ console.error(error); button.disabled=false; button.textContent='Retry import'; window.toast('Import failed — see console'); }
    });
  }

  function openAuthModal(state){
    window.openModal(`
      <div class="modal-title">Connect to DarkMatter Labs</div>
      <p class="modal-copy">Sign in to open the shared workspace. Local mode remains available until you import.</p>
      <div class="field"><label>Email</label><input id="supabaseEmail" type="email" autocomplete="email"></div>
      <div class="field"><label>Password</label><input id="supabasePassword" type="password" autocomplete="current-password"></div>
      <div class="modal-actions"><button class="btn btn-ghost" id="stayLocalBtn">Use local mode</button><button class="btn btn-primary" id="supabaseLoginBtn">Sign in</button></div>`);
    document.getElementById('stayLocalBtn').addEventListener('click',window.closeModal);
    document.getElementById('supabaseLoginBtn').addEventListener('click',async()=>{
      const email=document.getElementById('supabaseEmail').value.trim(), password=document.getElementById('supabasePassword').value;
      if(!email || !password){ window.toast('Enter your email and password'); return; }
      const button=document.getElementById('supabaseLoginBtn'); button.disabled=true; button.textContent='Signing in…';
      const { error }=await client().auth.signInWithPassword({email,password});
      if(error){ button.disabled=false; button.textContent='Sign in'; window.toast(error.message); return; }
      window.closeModal(); await startSupabaseSession(state, true);
    });
  }

  async function startSupabaseSession(state, force=false){
    if(!client() || !workspaceId()) return;
    const { data:{session}, error }=await client().auth.getSession();
    if(error){ console.error(error); return; }
    if(!session){ if(!window.__supabaseAuthPrompted || force){ window.__supabaseAuthPrompted=true; openAuthModal(state); } return; }
    try{
      const loaded=await loadRemoteState(state);
      if(loaded){ window.render(); window.toast('Connected to shared workspace'); }
      else openImportPrompt(state);
    }catch(error){ console.error(error); window.toast('Could not load shared workspace'); }
  }

  window.startSupabaseSession=startSupabaseSession;
})();
