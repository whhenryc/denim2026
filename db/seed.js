// 執行方式: npm run seed
// 用途: 建立第一個後台管理員帳號 + 少量示範資料，方便你一開始就見到前後台運作
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./database');

const ADMIN_USER = process.env.SEED_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.SEED_ADMIN_PASS || 'changeme123';

const existing = db.prepare('SELECT id FROM admin_users WHERE username = ?').get(ADMIN_USER);
if (!existing) {
  const hash = bcrypt.hashSync(ADMIN_PASS, 10);
  db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run(ADMIN_USER, hash);
  console.log(`已建立管理員帳號: ${ADMIN_USER} / ${ADMIN_PASS}`);
  console.log('請登入後台後盡快更改密碼（或直接修改 db 內嘅記錄）。');
} else {
  console.log('管理員帳號已存在，略過。');
}

// 示範靜態頁 block
const blocks = [
  ['home', 'hero_title', 'Festival Name', '活動名稱', null, null, null],
  ['about', 'intro', 'About Us', '關於我們', 'Write your English intro here.', '喺呢度寫關於我們嘅中文簡介。', null],
  ['contact', 'org_info', 'Organiser', '主辦單位', 'Address / email here', '地址 / email', null],
];
const insertBlock = db.prepare(`
  INSERT OR IGNORE INTO page_blocks (page_key, block_key, title_en, title_zh, content_en, content_zh, image)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);
blocks.forEach(b => insertBlock.run(...b));

console.log('示範資料已寫入。');
