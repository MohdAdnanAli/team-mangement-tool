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
      capacity INTEGER NOT NULL DEFAULT 40
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
      notes TEXT DEFAULT ''
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

    db.run(`INSERT INTO members VALUES ('mem-1','Abhijeet','Low-Level Design',38)`);
    db.run(`INSERT INTO members VALUES ('mem-2','Pandey Ji','Model and protype',35)`);
    db.run(`INSERT INTO members VALUES ('mem-3','Ashutosh Ji','High-Level Design',32)`);
    db.run(`INSERT INTO members VALUES ('mem-4','Jaiswal','Veriification team',30)`);

    db.run(`INSERT INTO projects VALUES ('proj-1','Dashboard','#4FD1C5')`);
    db.run(`INSERT INTO projects VALUES ('proj-2','Profile','#F2B84B')`);
    db.run(`INSERT INTO projects VALUES ('proj-3','Sub IsOrNot','#8AA4FF')`);
    db.run(`INSERT INTO projects VALUES ('proj-4','Bill life Cycle','#E8656A')`);
    db.run(`INSERT INTO projects VALUES ('proj-5','otp and mail services','#5FBF7A')`);
    db.run(`INSERT INTO projects VALUES ('proj-6','Entity Relation and clean design','#C792EA')`);

    db.run(`INSERT INTO tasks VALUES ('TSK-001','Ship new pricing page hero','proj-1','mem-1','progress','high','2026-08-02',8)`);
    db.run(`INSERT INTO tasks VALUES ('TSK-002','Wire up billing webhook retries','proj-1','mem-2','todo','high','2026-08-05',12)`);
    db.run(`INSERT INTO tasks VALUES ('TSK-003','Redesign onboarding checklist UI','proj-2','mem-3','review','med','2026-08-01',6)`);
    db.run(`INSERT INTO tasks VALUES ('TSK-004','Write regression suite for auth','proj-3','mem-4','progress','med','2026-08-08',10)`);
    db.run(`INSERT INTO tasks VALUES ('TSK-005','Fix Safari flex bug on dashboard','proj-1','mem-1','done','low','2026-07-22',3)`);
    db.run(`INSERT INTO tasks VALUES ('TSK-006','Customer migration runbook','proj-2','mem-2','todo','med','2026-08-10',5)`);
    db.run(`INSERT INTO tasks VALUES ('TSK-007','Internal CLI: add dry-run flag','proj-3','mem-2','done','low','2026-07-20',4)`);
    db.run(`INSERT INTO tasks VALUES ('TSK-008','Design system: audit spacing tokens','proj-3','mem-3','todo','low','2026-08-14',7)`);
    db.run(`INSERT INTO tasks VALUES ('TSK-010','Entity 101','proj-6','mem-1','todo','low','2026-10-05',6)`);
    db.run(`INSERT INTO tasks VALUES ('TSK-011','services 101','proj-4','mem-2','progress','med','2026-10-05',8)`);
    db.run(`INSERT INTO tasks VALUES ('TSK-012','system 101','proj-2','mem-3','review','low','2026-10-05',5)`);
    db.run(`INSERT INTO tasks VALUES ('TSK-013','Verification to the end','proj-3','mem-4','done','med','2026-10-05',7)`);

    db.run(`INSERT INTO bills VALUES ('bill-1','mem-1','INV-001','2026-07-01','2026-07-31',18,'2026-08-01','2026-08-15','sent','Payment via NEFT within 15 days of invoice date. Late payment attracts 2% interest per month.')`);
    db.run(`INSERT INTO bills VALUES ('bill-2','mem-3','INV-002','2026-07-01','2026-07-31',18,'2026-08-02','2026-08-16','draft','Draft — pending approval from the client.')`);

    db.run(`INSERT INTO line_items (billId,description,hours,rate) VALUES ('bill-1','Dashboard UI development',24,2500)`);
    db.run(`INSERT INTO line_items (billId,description,hours,rate) VALUES ('bill-1','Sprint planning & code review',8,2500)`);
    db.run(`INSERT INTO line_items (billId,description,hours,rate) VALUES ('bill-2','High-level architecture review',10,3000)`);
    db.run(`INSERT INTO line_items (billId,description,hours,rate) VALUES ('bill-2','Technical documentation',6,2500)`);

    db.run(`INSERT INTO meta VALUES ('taskSeq','13')`);
    db.run(`INSERT INTO meta VALUES ('billSeq','2')`);

    db.run('COMMIT');
  }

  /* -- Seed demo agreements (idempotent; separate guard so existing DBs get them too) -- */
  function seedAgreements() {
    const stmt = db.prepare('SELECT COUNT(*) as cnt FROM agreements');
    stmt.step();
    const row = stmt.getAsObject();
    stmt.free();
    if (row.cnt > 0) return;

    db.run('BEGIN TRANSACTION');
    db.run(`INSERT INTO agreements VALUES ('agr-1','Aurora Corp — Retainer terms','Aurora Corp (client)','₹1,20,000 / month','active','2026-06-01','Verbally agreed on the July 14 call: monthly retainer covers up to 40 hrs of dev work. Anything beyond is billed at ₹2,500/hr, invoiced separately. Retainer ends the month after either side gives written notice — no lock-in period.')`);
    db.run(`INSERT INTO agreements VALUES ('agr-2','Karan — overtime comp','Karan Mehta (internal)','1.5x day rate','settled','2026-05-10','Agreed verbally during the QA crunch: any weekend testing gets 1.5x day rate, paid out with the next cycle. Already settled for the May sprint — no balance owed.')`);
    db.run('COMMIT');
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

      // Seed if empty
      seedDefaults();
      seedAgreements();

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

    // Restore line items into bills
    for (const bill of state.bills) {
      bill.lineItems = queryAll('SELECT * FROM line_items WHERE billId=? ORDER BY id', [bill.id]);
      try{
        bill.flags = bill.flags ? JSON.parse(bill.flags) : [];
      }catch(e){ bill.flags = []; }
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
