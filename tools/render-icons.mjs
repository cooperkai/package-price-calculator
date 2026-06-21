// 圖示生成工具（非測試）：由 icons/icon.svg 渲染出 PWA 用的 PNG 圖示。
// 圖示更新流程：改 icons/icon.svg → 執行 `node tools/render-icons.mjs` → 產生 icons/icon-{192,512}.png。
// 用已安裝的 @playwright/test 內附的 chromium 渲染，無需額外依賴。
import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'

const svg = readFileSync('icons/icon.svg', 'utf8')
const browser = await chromium.launch()

for (const size of [192, 512]) {
  const page = await browser.newPage({ viewport: { width: size, height: size } })
  await page.setContent(
    `<!doctype html><html><body style="margin:0">
       <div style="width:${size}px;height:${size}px">${svg.replace('width="512" height="512"', 'width="100%" height="100%"')}</div>
     </body></html>`
  )
  await page.locator('svg').screenshot({ path: `icons/icon-${size}.png` })
  await page.close()
  console.log(`icons/icon-${size}.png 產生`)
}

await browser.close()
