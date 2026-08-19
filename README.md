# 活動網站骨架 (雙語 EN/繁 + 後台 CMS)

跟原網站（香港牛仔節）架構仿製嘅骨架，設計可以自由換，資料結構已經對應原站嘅內容分類。

## 技術棧
- Node.js + Express
- SQLite (better-sqlite3)
- EJS 樣板（server-rendered）
- express-session + connect-sqlite3（後台登入 session）
- multer（圖片/PDF上傳）

## 目錄結構
```
├── server.js              # 主入口
├── db/
│   ├── schema.sql          # 資料庫結構
│   ├── database.js         # DB 連接 + 自動建表
│   └── seed.js             # 建立第一個後台帳號 + 示範資料
├── middleware/
│   ├── auth.js              # 後台登入驗證
│   └── upload.js            # 圖片上傳設定
├── routes/
│   ├── public.js            # 前台頁面路由
│   ├── adminAuth.js         # 後台登入/登出
│   └── admin.js              # 後台 CRUD
├── views/
│   ├── public/               # 前台樣板
│   └── admin/                 # 後台樣板
└── public/
    ├── css/                    # 樣式（呢度換設計）
    ├── images/                 # 靜態圖 (logo等)
    └── uploads/                 # 後台上傳嘅圖/PDF
```

## 內容分類對應

| Content Type | 說明 |
|---|---|
| `news` | 最新消息，可連內部詳情頁或外部連結 |
| `programmes` | 活動資訊，支援 parent_id 巢狀（例如CENTRESTAGE底下有Showcase/Workshops） |
| `gdtp_designers` | GDTP設計師 profile |
| `press` | 媒體報導 |
| `publications` | 刊物/Lookbook (PDF) |
| `page_blocks` | About / Contact 等靜態頁嘅內容區塊，可自由增加 block |

## 本機開發

```bash
npm install
cp .env.example .env      # 記得改 SESSION_SECRET
npm run seed               # 建立第一個後台帳號 (預設 admin / changeme123)
npm start
```

- 前台: http://localhost:3000/zh
- 後台: http://localhost:3000/admin

## 部署上 Railway（跟你標準流程）

1. Push 呢個 repo 上 GitHub
2. Railway 開新 project → Deploy from GitHub repo
3. 加環境變數：`SESSION_SECRET`、`SEED_ADMIN_USER`、`SEED_ADMIN_PASS`
4. **重要**：SQLite 檔案需要持久化，Railway 要幫 Volume mount 去 **`/app/data`**（Settings → Volumes → Mount Path 填 `/app/data`）
   ⚠️ **千祈唔可以掛去 `/app/db`**！`db/` 資料夾入面裝住嘅係源碼（`database.js`、`schema.sql`、`seed.js`），如果Volume掛喺嗰度，會將啲源碼頂替走，導致 `Cannot find module '../db/database'` 呢類錯誤。持久化資料同源碼一定要分開資料夾。
5. Deploy 之後，喺 Railway 嘅 Shell（或者本機連線）一次性跑 `npm run seed` 建立管理員帳號
6. 之後每次 push 去 GitHub 就自動重新部署，`data/` 入面嘅內容唔會受影響

## 網站設計 (後台可換設計)

後台加咗一個「🎨 網站設計」頁（`/admin/theme`），可以喺唔使改code、唔使重新部署嘅情況下即時更換：
- 主色調 / 背景色 / 文字色（`--color-accent` / `--color-bg` / `--color-text` 三個CSS變數，`public/css/site.css`全部card/button/link都跟住呢三個變數）
- 字體（可以填CSS font-family，配合Google Fonts連結使用）
- Logo（上傳新圖直接換走）
- 自訂CSS（進階：直接寫CSS覆蓋任何樣式，會加喺 `</head>` 之前，優先級最高）

運作原理：呢啲設定存喺 `settings` 資料表，前台每次render都會讀取並輸出成inline `<style>` block（喺 `views/public/partials/header.ejs`），所以改完即刻全站生效。

如果之後想要更大幅度嘅設計改動（例如完全唔同嘅排版結構），就要直接改 `public/css/site.css` 同 `views/public/*.ejs` 嘅HTML結構，Theme頁淨係處理顏色/字體/logo/自訂CSS呢幾個層面。

## 常見問題 Troubleshooting

**Railway部署時 `npm install` 失敗，報 `better-sqlite3` / `node-gyp` / `distutils` 錯誤**
呢個係因為Railway預設用最新Node版本（例如24），`better-sqlite3` 呢類native套件未有對應嘅prebuilt binary，逼佢喺build時編譯，而編譯用嘅python環境又冇`distutils`，於是連環爆錯。
已經喺呢個project加咗 `package.json` 嘅 `engines` 欄位 + `.nvmrc` + `nixpacks.toml`，鎖定用 **Node 20 LTS**（呢個版本better-sqlite3一定有現成binary，唔使編譯）。如果Railway之後仲係用緊舊版cache，去 Railway → Settings → 清緩存重新部署一次，或者手動喺Railway嘅 Variables 加 `NIXPACKS_NODE_VERSION=20`。

## 下一步要做

1. **設計置換**：`public/css/site.css` 換晒你套新設計嘅CSS，views/public 入面嘅HTML結構可以照用，主要改 class name同排版
2. **Logo/圖片**：`public/images/` 放返個logo同其他固定圖
3. **匯入現有內容**：可以寫個一次性 script 讀CSV/JSON然後insert入DB，或者直接喺後台一個個輸入
4. **加返 SEO meta**（og:image, description等）— 而家骨架淨係得 title
5. **考慮加 rich text editor**（例如 Quill/TinyMCE）畀後台內文欄位用，而家淨係plain textarea，內文可以打HTML tag
6. **多語言擴充**：而家係 EN/繁雙語，如果之後要加簡體，schema同UI都要加多一組 `_scn` 欄位

呢個skeleton嘅CRUD邏輯全部已經跑得通（新增/編輯/刪除/上傳圖），你可以直接 `npm install` 試吓後台點用。
