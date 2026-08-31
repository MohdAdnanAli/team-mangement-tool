/* ============================= SQLite Database Layer =============================
 * Uses sql.js (SQLite compiled to WASM) for persistence.
 * DB is stored in IndexedDB between page loads.
 * Dual-write pattern: state object is the render cache, DB is the source of truth.
 * ============================================================================== */

const DB = (() => {
  let SQL = null;
  let db = null;
  let ready = false;
  const readyCallbacks = [];

  /* ---------- IndexedDB helpers for persisting the DB binary ---------- */
  const DB_NAME = 'ops-console-db';
  const STORE_NAME = 'sqlite';
  const KEY = 'database';

  function openIndexedDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = (e) => {
        e.target.result.createObjectStore(STORE_NAME);
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async function loadFromIndexedDB() {
    try {
      const idb = await openIndexedDB();
      return new Promise((resolve, reject) => {
        const tx = idb.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(KEY);
        req.onsuccess = () => {
          resolve(req.result || null);
          idb.close();
        };
        req.onerror = () => {
          reject(req.error);
          idb.close();
        };
      });
    } catch (e) {
      console.warn('IndexedDB read failed, starting fresh:', e);
      return null;
    }
  }

  async function saveToIndexedDB() {
    if (!db) return;
    try {
      const data = db.export();
      const blob = new Blob([data], { type: 'application/x-sqlite3' });
      const idb = await openIndexedDB();
      return new Promise((resolve, reject) => {
        const tx = idb.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(blob, KEY);
        req.onsuccess = () => { resolve(); idb.close(); };
        req.onerror = () => { reject(req.error); idb.close(); };
      });
    } catch (e) {
      console.error('Failed to persist DB to IndexedDB:', e);
    }
  }

  /* ---------- Debounced auto-save ---------- */
  let saveTimer = null;
  function scheduleSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveToIndexedDB().catch(console.error);
      saveTimer = null;
    }, 300);
  }

  /* ---------- Schema ---------- */
  const SCHEMA = `
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT '',
      capacity INTEGER NOT NULL DEFAULT 40,
      avatar TEXT DEFAULT '',
      stats TEXT DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#4FD1C5'
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      projectId TEXT DEFAULT '',
      assigneeId TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'todo',
      priority TEXT NOT NULL DEFAULT 'med',
      due TEXT NOT NULL DEFAULT '',
      meta TEXT DEFAULT '',
      hours INTEGER NOT NULL DEFAULT 4
    );

    CREATE TABLE IF NOT EXISTS bills (
      id TEXT PRIMARY KEY,
      memberId TEXT DEFAULT '',
      billNumber TEXT NOT NULL DEFAULT '',
      periodStart TEXT NOT NULL DEFAULT '',
      periodEnd TEXT NOT NULL DEFAULT '',
      flags TEXT DEFAULT '',
      taxRate INTEGER NOT NULL DEFAULT 18,
      issueDate TEXT NOT NULL DEFAULT '',
      dueDate TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft',
      notes TEXT DEFAULT '',
      party TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS line_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      billId TEXT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
      description TEXT NOT NULL DEFAULT '',
      hours REAL NOT NULL DEFAULT 0,
      rate REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS agreements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      party TEXT DEFAULT '',
      amount TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active',
      dateAgreed TEXT NOT NULL DEFAULT '',
      terms TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS one_on_ones (
      id TEXT PRIMARY KEY,
      memberId TEXT NOT NULL,
      date TEXT NOT NULL DEFAULT '',
      behaviourScore INTEGER NOT NULL DEFAULT 3,
      behaviourNote TEXT DEFAULT '',
      natureScore INTEGER NOT NULL DEFAULT 3,
      natureNote TEXT DEFAULT '',
      deadlineScore INTEGER NOT NULL DEFAULT 3,
      deadlineNote TEXT DEFAULT '',
      extraScore INTEGER NOT NULL DEFAULT 3,
      extraNote TEXT DEFAULT '',
      extraTags TEXT DEFAULT '[]',
      nextActions TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `;

  /* ---------- Seed default data ---------- */
  function seedDefaults() {
    const stmt = db.prepare('SELECT COUNT(*) as cnt FROM members');
    stmt.step();
    const row = stmt.getAsObject();
    stmt.free();
    if (row.cnt > 0) return;

    db.run('BEGIN TRANSACTION');

    const members = [
      ['mem-1','Abhijeet','Low-Level Design',40,'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80'],
      ['mem-2','Pandey','Data Model & Prototyping',35,'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80'],
      ['mem-3','Ashutosh','Senior Developer — System Design Lead',36,'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80'],
      ['mem-4','Jaiswal','Verification & QA',30,'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=80'],
      ['mem-5','Awara Singh','Frontend & Product UI',34,'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=240&q=80'],
      ['mem-6','Adnan','Product & Compliance Lead',20,'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80'],
      ['mem-7','Shivakashi','Unassigned — Clearance Pending',8,'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=240&q=80'],
    ];
    const projects = [
      ['proj-1','Core Deal Pipeline','#5B4FCF'], ['proj-2','OTP & Sealing','#6D5DF6'],
      ['proj-3','Bill Generation & Invoicing','#F2B84B'], ['proj-4','Distribution & Notifications','#5FBF7A'],
      ['proj-5','Seller & Buyer UI','#8AA4FF'], ['proj-6','Security & Compliance','#E8656A'],
    ];
    const tasks = [
      ['TSK-001','Batch buyer-leg order creation','proj-1','mem-1','done','high','2026-07-25',10], ['TSK-002','Redis TTL + rate limiting on public SO routes','proj-1','mem-1','done','high','2026-07-28',8], ['TSK-003','Seller-initiated resend-link endpoint','proj-1','mem-1','todo','med','2026-09-05',6],
      ['TSK-004','Register SMS templates with DLT aggregator','proj-2','mem-6','progress','high','2026-09-10',4], ['TSK-005','Build OTP request/verify service','proj-2','mem-4','todo','high','2026-09-15',14], ['TSK-006','Lock-at-3-attempts + unlock flow','proj-2','mem-4','todo','med','2026-09-18',6],
      ['TSK-007','Build M7 bill generation service','proj-3','mem-1','todo','high','2026-09-20',16], ['TSK-008','DB-enforce sequential invoice numbering','proj-3','mem-2','todo','high','2026-09-12',8], ['TSK-009','Confirm GST IRN threshold applicability','proj-3','mem-6','todo','high','2026-09-08',3],
      ['TSK-010','Build NotificationService (SES + MSG91)','proj-4','mem-1','progress','high','2026-09-06',12], ['TSK-011','Wire SO-link auto-send on generate/resend','proj-4','mem-1','progress','high','2026-09-04',6],
      ['TSK-012','Seller dashboard shell (Next.js)','proj-5','mem-5','todo','high','2026-09-14',20], ['TSK-013','Buyer public verification pages','proj-5','mem-5','todo','high','2026-09-16',18], ['TSK-014','Wire Seller UI to backend APIs','proj-5','mem-1','todo','high','2026-09-22',10],
      ['TSK-015','DPDP consent flow & legal review','proj-6','mem-6','todo','high','2026-09-10',8], ['TSK-016','Encryption-at-rest for GSTIN/phone/payment','proj-6','mem-3','todo','high','2026-09-12',10], ['TSK-017','Set budget ceiling & cost-alert thresholds','proj-6','mem-3','todo','med','2026-09-09',4], ['TSK-018','Architecture review & final sign-off across all modules','proj-6','mem-3','progress','high','2026-12-01',20], ['TSK-019','Complete onboarding: marketing, legal & bank clearance','proj-6','mem-7','todo','high','2026-09-30',2], ['TSK-020','Draft storage-scaling design (M14)','proj-1','mem-2','todo','low','2026-11-01',6], ['TSK-021','E2E regression suite for OTP + seal flow','proj-2','mem-4','todo','med','2026-09-20',10],
    ];
    const memberStmt = db.prepare('INSERT INTO members (id,name,role,capacity,avatar) VALUES (?,?,?,?,?)');
    members.forEach(row => memberStmt.run(row)); memberStmt.free();
    const projectStmt = db.prepare('INSERT INTO projects (id,name,color) VALUES (?,?,?)');
    projects.forEach(row => projectStmt.run(row)); projectStmt.free();
    const taskStmt = db.prepare('INSERT INTO tasks (id,title,projectId,assigneeId,status,priority,due,hours,meta) VALUES (?,?,?,?,?,?,?,?,?)');
    tasks.forEach(row => taskStmt.run([...row, '{}'])); taskStmt.free();

    db.run(`INSERT INTO bills (id, memberId, billNumber, periodStart, periodEnd, flags, taxRate, issueDate, dueDate, status, notes, party) VALUES ('bill-1','mem-1','INV-001','2026-07-01','2026-07-31','["urgent","reviewed"]',18,'2026-08-01','2026-08-15','sent','Payment via NEFT within 15 days of invoice date. Late payment attracts 2% interest per month.','Kranti')`);
    db.run(`INSERT INTO bills (id, memberId, billNumber, periodStart, periodEnd, flags, taxRate, issueDate, dueDate, status, notes, party) VALUES ('bill-2','mem-3','INV-002','2026-07-01','2026-07-31','["recurring"]',18,'2026-08-02','2026-08-16','draft','Draft — pending approval.','Kranti')`);

    db.run(`INSERT INTO line_items (billId,description,hours,rate) VALUES ('bill-1','Core deal pipeline development',24,2500)`);
    db.run(`INSERT INTO line_items (billId,description,hours,rate) VALUES ('bill-1','Sprint planning & code review',8,2500)`);
    db.run(`INSERT INTO line_items (billId,description,hours,rate) VALUES ('bill-2','High-level architecture review',10,3000)`);
    db.run(`INSERT INTO line_items (billId,description,hours,rate) VALUES ('bill-2','Technical documentation',6,2500)`);

    db.run(`INSERT INTO meta VALUES ('taskSeq','21')`);
    db.run(`INSERT INTO meta VALUES ('billSeq','2')`);

    db.run('COMMIT');
  }

  function seedOneOnOnes() {
    const stmt = db.prepare('SELECT COUNT(*) as cnt FROM one_on_ones');
    stmt.step();
    const row = stmt.getAsObject();
    stmt.free();
    if (row.cnt > 0) return;

    db.run('BEGIN TRANSACTION');
    db.run(`INSERT INTO one_on_ones VALUES ('o3-1','mem-1','2026-08-12',4,'Shared progress and raised a trade-off before it affected the planned work.',4,'Implementation notes and review comments made the handoff easier to follow.',4,'Flagged the remaining risk early and confirmed the revised completion plan.',5,'Reviewed a related area and documented a useful follow-up.','["ownership","quality"]','Write the next delivery risk in the ticket before the weekly check-in.')`);
    db.run(`INSERT INTO one_on_ones VALUES ('o3-2','mem-2','2026-08-18',3,'Contributions were useful, but the timeline change was not communicated early enough.',3,'The initial implementation was clear; the production follow-through needs a more explicit plan.',2,'A planned task stayed open after its date without an updated estimate or blocker note.',3,'Took on a small follow-up without being asked.','["initiative","scope-creep"]','Add a midpoint update for work that may miss its planned date.')`);
    db.run(`INSERT INTO one_on_ones VALUES ('o3-3','mem-3','2026-08-20',5,'Kept the discussion constructive and translated decisions into clear next steps.',5,'The technical notes gave the team a usable decision record.',4,'The remaining work was flagged early, with a clear completion plan.',4,'Helped turn the work summary into a clear client-facing update.','["communication","mentoring"]','Use the same decision-record format for the next cross-team change.')`);
    db.run(`INSERT INTO one_on_ones VALUES ('o3-4','mem-4','2026-08-22',4,'Updates were concise and based on verification evidence.',4,'The validation work was thorough and aligned with the assigned scope.',5,'The planned verification was completed on time with no unresolved handoff.',3,'A short written summary would help others act on the findings faster.','["quality"]','Bring one verification finding to the next team readout.')`);
    db.run(`UPDATE members SET stats='{"serious":2,"procrastinations":0,"dealings":1,"extra":2}' WHERE id='mem-1'`);
    db.run(`UPDATE members SET stats='{"serious":0,"procrastinations":2,"dealings":0,"extra":1}' WHERE id='mem-2'`);
    db.run(`UPDATE members SET stats='{"serious":1,"procrastinations":0,"dealings":2,"extra":1}' WHERE id='mem-3'`);
    db.run(`UPDATE members SET stats='{"serious":1,"procrastinations":0,"dealings":0,"extra":0}' WHERE id='mem-4'`);
    db.run('COMMIT');
  }

  // Replace only the untouched, original mock dataset. Once a user has added or
  // changed records, its shape no longer matches and it is never reset here.
  function replaceLegacyMockDataset() {
    const legacy = queryOne(`
      SELECT
        (SELECT COUNT(*) FROM members) AS memberCount,
        (SELECT COUNT(*) FROM tasks) AS taskCount,
        (SELECT COUNT(*) FROM projects) AS projectCount,
        (SELECT COUNT(*) FROM bills) AS billCount,
        (SELECT COUNT(*) FROM members WHERE id='mem-2' AND name='Pandey Ji') AS isLegacy
    `);
    if(!legacy || legacy.memberCount !== 4 || legacy.taskCount !== 12 || legacy.projectCount !== 6 || legacy.billCount !== 2 || legacy.isLegacy !== 1) return;

    db.run('BEGIN TRANSACTION');
    db.run('DELETE FROM line_items');
    db.run('DELETE FROM one_on_ones');
    db.run('DELETE FROM bills');
    db.run('DELETE FROM tasks');
    db.run('DELETE FROM agreements');
    db.run('DELETE FROM projects');
    db.run('DELETE FROM members');
    db.run("DELETE FROM meta WHERE key IN ('taskSeq','billSeq','checkInCopyVersion')");
    db.run('COMMIT');
  }

  // Refresh only the bundled sample records. User-created check-ins are untouched.
  function refreshSampleCheckInCopy() {
    if(getMeta('checkInCopyVersion', '') === '2') return;
    db.run("UPDATE one_on_ones SET behaviourNote='Shared progress and raised a trade-off before it affected the planned work.', natureNote='Implementation notes and review comments made the handoff easier to follow.', deadlineNote='Flagged the remaining risk early and confirmed the revised completion plan.', extraNote='Reviewed a related area and documented a useful follow-up.', nextActions='Write the next delivery risk in the ticket before the weekly check-in.' WHERE id='o3-1'");
    db.run("UPDATE one_on_ones SET behaviourNote='Contributions were useful, but the timeline change was not communicated early enough.', natureNote='The initial implementation was clear; the production follow-through needs a more explicit plan.', deadlineNote='A planned task stayed open after its date without an updated estimate or blocker note.', extraNote='Took on a small follow-up without being asked.', extraTags='[\"initiative\",\"scope-creep\"]', nextActions='Add a midpoint update for work that may miss its planned date.' WHERE id='o3-2'");
    db.run("UPDATE one_on_ones SET behaviourNote='Kept the discussion constructive and translated decisions into clear next steps.', natureNote='The technical notes gave the team a usable decision record.', deadlineNote='The remaining work was flagged early, with a clear completion plan.', extraNote='Helped turn the work summary into a clear client-facing update.', nextActions='Use the same decision-record format for the next cross-team change.' WHERE id='o3-3'");
    db.run("UPDATE one_on_ones SET behaviourNote='Updates were concise and based on verification evidence.', natureNote='The validation work was thorough and aligned with the assigned scope.', deadlineNote='The planned verification was completed on time with no unresolved handoff.', extraNote='A short written summary would help others act on the findings faster.', nextActions='Bring one verification finding to the next team readout.' WHERE id='o3-4'");
    setMeta('checkInCopyVersion', '2');
  }

  /* -- Seed demo agreements (idempotent; separate guard so existing DBs get them too) -- */
  function seedAgreements() {
    const stmt = db.prepare('SELECT COUNT(*) as cnt FROM agreements');
    stmt.step();
    const row = stmt.getAsObject();
    stmt.free();
    if (row.cnt > 0) return;

    db.run('BEGIN TRANSACTION');
    db.run(`INSERT INTO agreements VALUES ('agr-1','Kranti — delivery retainer terms','Kranti (client)','₹1,20,000 / month','active','2026-06-01','Monthly retainer covers delivery work across the Core Deal Pipeline, OTP, billing, notifications, UI, and compliance streams. Work beyond the agreed scope is invoiced separately at ₹2,500/hr.')`);
    db.run(`INSERT INTO agreements VALUES ('agr-2','Kranti — security & compliance scope','Kranti (client)','Included in delivery scope','active','2026-08-20','DPDP consent, encryption safeguards, GST IRN review, and cost-alert controls are tracked as release prerequisites before final architecture sign-off.')`);
    db.run('COMMIT');
  }

  /* -- Detect and fix corrupted task rows that happened when schema changed -- */
  function detectAndFixCorruptTasks(){
    try{
      const rows = queryAll('SELECT id,title,projectId,assigneeId,due FROM tasks');
      if(!rows || rows.length===0) return;
      let bad = 0;
      for(const r of rows){
        const t = String(r.title || '');
        // title should not be a project id or a date; if it looks like 'proj-' or YYYY-MM-DD, count as bad
        if(/^proj-/.test(t) || /^mem-/.test(t) || /^\d{4}-\d{2}-\d{2}$/.test(t) || t.length < 3) bad++;
      }
      const ratio = bad / rows.length;
      if(ratio > 0.4){
        console.warn('Detected malformed task records; they were left unchanged to avoid overwriting user data.');
      }
    }catch(e){ console.warn('Task corruption detection failed', e); }
  }

  /* ---------- Init ---------- */
  async function init() {
    try {
      // Load sql.js
      SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
      });

      // Try to load existing DB from IndexedDB
      const saved = await loadFromIndexedDB();
      if (saved) {
        const arrayBuffer = await saved.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        db = new SQL.Database(uint8Array);
      } else {
        db = new SQL.Database();
      }

      // SQLite only enforces foreign keys when enabled for this connection.
      db.run('PRAGMA foreign_keys = ON');

      // Ensure schema exists
      db.run(SCHEMA);

      // Migration: add `flags` column to bills if it doesn't exist (for existing DBs)
      try{
        const pragma = db.exec("PRAGMA table_info('bills')");
        if(pragma && pragma.length && pragma[0].values){
          const cols = pragma[0].values.map(v => v[1]);
          if(!cols.includes('flags')){
            db.run("ALTER TABLE bills ADD COLUMN flags TEXT DEFAULT ''");
          }
        }
      }catch(e){ console.warn('Migration check for bills.flags failed', e); }

      // Migration: add `meta` column to tasks if it doesn't exist (for existing DBs)
      try{
        const pragmaTasks = db.exec("PRAGMA table_info('tasks')");
        if(pragmaTasks && pragmaTasks.length && pragmaTasks[0].values){
          const cols = pragmaTasks[0].values.map(v => v[1]);
          if(!cols.includes('meta')){
            db.run("ALTER TABLE tasks ADD COLUMN meta TEXT DEFAULT ''");
          }
        }
      }catch(e){ console.warn('Migration check for tasks.meta failed', e); }

      function ensureColumn(table, col, ddl){
        try{
          const pragma = db.exec(`PRAGMA table_info('${table}')`);
          if(pragma && pragma.length && pragma[0].values){
            const cols = pragma[0].values.map(v => v[1]);
            if(!cols.includes(col)) db.run(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
          }
        }catch(e){ console.warn(`Migration check for ${table}.${col} failed`, e); }
      }
      ensureColumn('members', 'avatar', "avatar TEXT DEFAULT ''");
      ensureColumn('members', 'stats', "stats TEXT DEFAULT '{}'");
      ensureColumn('bills', 'party', "party TEXT DEFAULT ''");

      // Bring the pristine legacy mock data forward, but never overwrite a
      // dataset that has been edited or extended by a user.
      replaceLegacyMockDataset();

      // Seed if empty
      seedDefaults();
      seedAgreements();
      seedOneOnOnes();
      refreshSampleCheckInCopy();
      // Detect and fix any corrupted task rows from prior schema changes
      detectAndFixCorruptTasks();

      ready = true;
      readyCallbacks.forEach(fn => fn());
      readyCallbacks.length = 0;
      scheduleSave();
    } catch (err) {
      console.error('SQLite init failed:', err);
      // Fallback: still call ready callbacks so the app loads (with in-memory state)
      ready = true;
      readyCallbacks.forEach(fn => fn());
      readyCallbacks.length = 0;
    }
  }

  /* ---------- Public API ---------- */

  function onReady(fn) {
    if (ready) { fn(); return; }
    readyCallbacks.push(fn);
  }

  function getReady() { return ready; }

  /* -- Query helpers -- */
  function queryAll(sql, params = []) {
    const stmt = db.prepare(sql);
    if (params.length) stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  }

  function queryOne(sql, params = []) {
    const stmt = db.prepare(sql);
    if (params.length) stmt.bind(params);
    let row = null;
    if (stmt.step()) row = stmt.getAsObject();
    stmt.free();
    return row;
  }

  function execute(sql, params = []) {
    db.run(sql, params);
    scheduleSave();
  }

  function executeMany(sql, rows) {
    db.run('BEGIN TRANSACTION');
    const stmt = db.prepare(sql);
    for (const row of rows) {
      stmt.run(Object.values(row));
    }
    stmt.free();
    db.run('COMMIT');
    scheduleSave();
  }

  /* -- CRUD -- */
  function insert(table, data) {
    const keys = Object.keys(data);
    const placeholders = keys.map(() => '?').join(',');
    const values = keys.map(k => data[k]);
    db.run(`INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`, values);
    scheduleSave();
  }

  function update(table, data, whereKey, whereVal) {
    const keys = Object.keys(data);
    const setClause = keys.map(k => `${k}=?`).join(',');
    const values = keys.map(k => data[k]);
    values.push(whereVal);
    db.run(`UPDATE ${table} SET ${setClause} WHERE ${whereKey}=?`, values);
    scheduleSave();
  }

  function remove(table, whereKey, whereVal) {
    db.run(`DELETE FROM ${table} WHERE ${whereKey}=?`, [whereVal]);
    scheduleSave();
  }

  function removeWhere(table, whereClause, params = []) {
    db.run(`DELETE FROM ${table} WHERE ${whereClause}`, params);
    scheduleSave();
  }

  /* -- Meta helpers -- */
  function getMeta(key, defaultVal = '0') {
    const row = queryOne('SELECT value FROM meta WHERE key=?', [key]);
    return row ? row.value : defaultVal;
  }

  function setMeta(key, value) {
    db.run('INSERT OR REPLACE INTO meta (key, value) VALUES (?,?)', [key, String(value)]);
    scheduleSave();
  }

  /* -- State restoration -- */
  function restoreState(state) {
    state.members = queryAll('SELECT * FROM members ORDER BY id');
    state.members.forEach(m => {
      try{ m.stats = m.stats ? JSON.parse(m.stats) : {}; }catch(e){ m.stats = {}; }
      m.stats = {
        serious: Number(m.stats.serious) || 0,
        procrastinations: Number(m.stats.procrastinations) || 0,
        dealings: Number(m.stats.dealings) || 0,
        extra: Number(m.stats.extra) || 0,
      };
    });
    state.projects = queryAll('SELECT * FROM projects ORDER BY id');
    state.tasks = queryAll('SELECT * FROM tasks ORDER BY id');
    // Ensure `meta` is parsed into an object for each task
    state.tasks.forEach(t => {
      try{
        t.meta = t.meta ? JSON.parse(t.meta) : {};
      }catch(e){ t.meta = {}; }
      // Normalize expected meta fields
      t.meta.description = t.meta.description || '';
      t.meta.labels = Array.isArray(t.meta.labels) ? t.meta.labels : [];
      t.meta.checklist = Array.isArray(t.meta.checklist) ? t.meta.checklist : [];
      t.meta.attachments = Array.isArray(t.meta.attachments) ? t.meta.attachments : [];
      t.meta.activity = Array.isArray(t.meta.activity) ? t.meta.activity : [];
    });
    state.bills = queryAll('SELECT * FROM bills ORDER BY id');
    state.agreements = queryAll('SELECT * FROM agreements ORDER BY id');
    state.oneOnOnes = queryAll('SELECT * FROM one_on_ones ORDER BY date DESC, id DESC');

    // Restore line items into bills
    for (const bill of state.bills) {
      bill.lineItems = queryAll('SELECT * FROM line_items WHERE billId=? ORDER BY id', [bill.id]) || [];
      bill.party = bill.party || '';
      try{
        bill.flags = bill.flags ? JSON.parse(bill.flags) : [];
      }catch(e){ bill.flags = []; }
      if(!Array.isArray(bill.flags)) bill.flags = [];
    }

    if(window.normalizeOneOnOne){
      state.oneOnOnes = state.oneOnOnes.map(row => window.normalizeOneOnOne(row));
    }

    state.taskSeq = parseInt(getMeta('taskSeq', '13'));
    state.billSeq = parseInt(getMeta('billSeq', '0'));
  }

  /* -- Line items (bulk replace) -- */
  function replaceLineItems(billId, items) {
    db.run('DELETE FROM line_items WHERE billId=?', [billId]);
    const stmt = db.prepare('INSERT INTO line_items (billId,description,hours,rate) VALUES (?,?,?,?)');
    for (const item of items) {
      stmt.run([billId, item.description, item.hours, item.rate]);
    }
    stmt.free();
    scheduleSave();
  }

  /* -- Export for manual backup -- */
  function exportDB() {
    return db.export();
  }

  /* -- Init -- */
  init();

  return {
    onReady,
    getReady,
    queryAll,
    queryOne,
    execute,
    executeMany,
    insert,
    update,
    remove,
    removeWhere,
    getMeta,
    setMeta,
    restoreState,
    replaceLineItems,
    exportDB,
    saveToIndexedDB,
  };
})();
