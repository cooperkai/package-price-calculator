// 部署前更新 Service Worker 快取版本（task 6.4）。
//
// 為什麼需要：瀏覽器靠「sw.js 位元組是否改變」決定要不要更新 SW；靜態資源
// （CSS/JS）採快取優先，若改了樣式卻沒換版本號，舊用戶會一直吃到舊快取。
// 本腳本把 sw.js 的 VERSION 改寫成「目前的 git commit 短雜湊」，使每次部署都
// 觸發重新預快取、清掉舊版快取；且能從 devtools 看到的快取名反查是哪一版程式碼。
//
// 主要由 GitHub Actions 部署流程（.github/workflows/deploy.yml）於部署當下自動執行，
// 寫入的是「正在部署的那個 commit」之短雜湊（無 off-by-one），毋需人工記得。
// 也可在本機手動跑 `npm run bump-sw` 預覽／測試。
//
// 用法：npm run bump-sw

import { readFile, writeFile } from 'node:fs/promises'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const SW_PATH = join(dirname(fileURLToPath(import.meta.url)), '..', 'sw.js')

let sha
try {
  sha = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
} catch {
  console.error('無法取得 git commit 雜湊，請在 git 倉庫內執行。')
  process.exit(1)
}

const src = await readFile(SW_PATH, 'utf8')
const re = /const VERSION = '[^']*'/
const m = src.match(/const VERSION = '([^']*)'/)
if (!m) {
  console.error("找不到 sw.js 的 VERSION 宣告（預期格式 const VERSION = '...'）")
  process.exit(1)
}

const updated = src.replace(re, `const VERSION = '${sha}'`)
await writeFile(SW_PATH, updated)
console.log(`SW 快取版本：${m[1]} → ${sha}`)
