const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 注意：上傳嘅圖片一定要放喺 DATA_DIR 之內(同SQLite database.js用緊嗰個Volume共用)，
// 唔可以擺喺 public/uploads，因為 public/ 屬於source code嘅一部分，
// 每次Railway重新部署個container filesystem都會reset，
// 擺喺嗰度嘅檔案會跟住消失，但DB入面記錄住嘅圖片路徑就會變成斷link。
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const uploadDir = path.join(DATA_DIR, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
try { fs.chmodSync(uploadDir, 0o777); } catch (e) { /* ignore */ }

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '-');
    cb(null, `${Date.now()}-${base}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (req, file, cb) => {
    const ok = /jpeg|jpg|png|webp|avif|gif|pdf|svg/.test(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error('不支援嘅檔案類型'), ok);
  }
});

module.exports = upload;
