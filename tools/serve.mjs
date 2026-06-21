// 極小靜態檔案伺服器（Node 內建模組、零額外依賴）。
//
// 用途有二：
//   1. Playwright E2E 的 webServer（playwright.config.js 自動起、自動關），取代 python http.server。
//   2. 開發時手動預覽頁面：`npm run dev` → 瀏覽器開 http://127.0.0.1:8123/（Ctrl+C 停）。
// 用法：npm run dev（預設 8123）；換 port：npm run dev -- 8124；或直接 node tools/serve.mjs [port]
//
// 為什麼需要它：index.html 用 ES modules（import ... from './calc.js'），
// 瀏覽器規定模組只能從 http:// 載入、不能用 file:// 雙擊開，所以要有個 http 來源把檔案端出來。
//
// 本質就是 web server 的三步驟：收請求 → 把網址對應到硬碟上的檔案 → 讀檔回傳（找不到回 404）。

import { createServer } from 'node:http'          // Node 內建：HTTP server 引擎（server 由此而來）
import { readFile } from 'node:fs/promises'        // 讀檔
import { extname, join, normalize, relative } from 'node:path'

const PORT = Number(process.argv[2]) || 8123       // 監聽的 port（可由命令列參數覆寫）
const ROOT = process.cwd()                         // 網站根目錄 = 執行指令時的工作目錄

// 副檔名 → MIME 類型。ES modules 需正確 MIME（.js 必須是 text/javascript，否則瀏覽器拒絕載入模組）。
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
}

// createServer 的回呼：每收到「一個」HTTP 請求就執行一次（req=請求、res=回應）。
const server = createServer(async (req, res) => {
  try {
    // 步驟 1：看瀏覽器要哪個路徑。例：請求 GET /js/main.js → urlPath 為 '/js/main.js'。
    //         decodeURIComponent 還原中文等被編碼的字元；用 URL 解析可順手去掉 ?query。
    const urlPath = decodeURIComponent(new URL(req.url, `http://127.0.0.1:${PORT}`).pathname)

    // 步驟 2：把網址路徑對應到硬碟上的實體檔案。例：'/js/main.js' → ROOT/js/main.js。
    let filePath = normalize(join(ROOT, urlPath))

    // 安全：防「目錄穿越」。若有人請求 /../../secret，對應出的路徑會跑到 ROOT 外面，
    //       relative(ROOT, filePath) 會以 '..' 開頭 → 一律擋掉，只准存取 ROOT 內的檔。
    if (relative(ROOT, filePath).startsWith('..')) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('403 Forbidden')
      return
    }

    // 慣例：路徑以 '/' 結尾（如首頁 '/'）→ 對應到該資料夾的 index.html。
    if (urlPath.endsWith('/')) filePath = join(filePath, 'index.html')

    // 步驟 3：讀檔。檔案不存在會 throw → 落到下方 catch 回 404。
    const data = await readFile(filePath)

    // 步驟 4：設定回應標頭（200 成功 + 依副檔名給正確 Content-Type）。
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' })

    // 步驟 5：把檔案內容回傳給瀏覽器，結束這次回應。
    res.end(data)
  } catch {
    // 讀不到檔（路徑錯、檔案不存在等）→ 回 404。
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('404 Not Found')
  }
})

// 在 127.0.0.1（本機回環位址，只有自己連得到）的指定 port 開始「聽」請求。
server.listen(PORT, '127.0.0.1', () => {
  console.log(`靜態伺服器啟動：http://127.0.0.1:${PORT}/（root: ${ROOT}）`)
})
