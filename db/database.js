const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// 注意：資料庫檔案刻意放喺 db/ 之外嘅 data/ 資料夾。
// db/ 入面淨係放源碼(schema.sql, database.js, seed.js)，要跟部署一齊上。
// Railway嘅persistent Volume要掛喺 data/ 資料夾，唔係掛喺 db/，
// 否則個Volume會頂替埋db/入面嘅源碼，導致 "Cannot find module" 錯誤。
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');

try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  // Railway Volume掛載點預設權限可能限制寫入，強制放寬確保app可以寫檔
  fs.chmodSync(DATA_DIR, 0o777);
} catch (e) {
  console.error(`[db] 無法建立或設定 DATA_DIR 權限: ${DATA_DIR}`);
  console.error(e);
}

const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'data.sqlite');

console.log(`[db] DATA_DIR = ${DATA_DIR}`);
console.log(`[db] DB_PATH  = ${DB_PATH}`);

let db;
try {
  db = new Database(DB_PATH);
} catch (err) {
  console.error('========================================');
  console.error('[db] 開啟資料庫失敗！常見原因:');
  console.error('  1. Volume冇正確掛喺 DATA_DIR 呢個路徑');
  console.error('  2. Volume掛載點權限問題(呢個code已經try過chmod 777)');
  console.error(`  3. 檢查Railway Volume嘅Mount Path係咪同 DATA_DIR 完全一致: ${DATA_DIR}`);
  console.error('========================================');
  throw err;
}

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 首次啟動自動建表
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

module.exports = db;
