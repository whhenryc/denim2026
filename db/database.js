const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// 注意：資料庫檔案刻意放喺 db/ 之外嘅 data/ 資料夾。
// db/ 入面淨係放源碼(schema.sql, database.js, seed.js)，要跟部署一齊上。
// Railway嘅persistent Volume要掛喺 data/ 資料夾，唔係掛喺 db/，
// 否則個Volume會頂替埋db/入面嘅源碼，導致 "Cannot find module" 錯誤。
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'data.sqlite');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 首次啟動自動建表
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

module.exports = db;
