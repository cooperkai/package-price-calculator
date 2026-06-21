import { test, expect } from '@playwright/test'

// 響應式版面與 PWA 安裝 E2E／視覺檢查（task 6.3，對應 5.1/5.2 樣式與 1.3 manifest）。
// 驗證：手機 <600px 無水平溢出、觸控目標 ≥44px、select 與 input 同高（鎖定手機
// 原生渲染不一致的修正）、行動優先媒體查詢於寬螢幕向上增強；以及 manifest 具備
// 「新增至主畫面（A2HS）」所需的可安裝欄位。

const MOBILE = { width: 360, height: 780 }   // 極窄機（< 600px）
const DESKTOP = { width: 900, height: 800 }  // 觸發 min-width:600 增強

/** 取元素渲染高度（boundingBox），找不到則回 0。 */
async function heightOf(page, selector) {
  const box = await page.locator(selector).boundingBox()
  return box ? box.height : 0
}

test.describe('響應式版面與 PWA 安裝（task 6.3）', () => {
  test('手機寬度（<600px）無水平溢出', async ({ page }) => {
    await page.setViewportSize(MOBILE)
    await page.goto('/')

    // 文件捲動寬度不應超過可視寬度（否則會出現惱人的橫向捲軸）
    const { scrollW, clientW } = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }))
    expect(scrollW).toBeLessThanOrEqual(clientW)
  })

  test('觸控目標 ≥44px，且 select 與 input 同高（手機一致性修正）', async ({ page }) => {
    await page.setViewportSize(MOBILE)
    await page.goto('/')

    const inputH = await heightOf(page, '#price')
    const currencyH = await heightOf(page, '#currency')
    const unitH = await heightOf(page, '#unit')
    const btnH = await heightOf(page, '#calc-btn')

    // 拇指好按：互動元件高度皆 ≥44px
    for (const h of [inputH, currencyH, unitH, btnH]) {
      expect(h).toBeGreaterThanOrEqual(44)
    }
    // select（幣別／單位）與 input 同高——關掉原生外觀後才一致
    expect(Math.abs(currencyH - inputH)).toBeLessThan(1.5)
    expect(Math.abs(unitH - inputH)).toBeLessThan(1.5)
  })

  test('select 自繪箭頭，已關閉原生外觀', async ({ page }) => {
    await page.setViewportSize(MOBILE)
    await page.goto('/')
    const appearance = await page.locator('#currency').evaluate(
      (el) => getComputedStyle(el).appearance || getComputedStyle(el).webkitAppearance
    )
    expect(appearance).toBe('none')
  })

  test('行動優先：寬螢幕（≥600px）加大外距（min-width 媒體查詢生效）', async ({ page }) => {
    await page.goto('/')

    await page.setViewportSize(MOBILE)
    const mobilePad = await page.evaluate(() => getComputedStyle(document.body).paddingTop)

    await page.setViewportSize(DESKTOP)
    const desktopPad = await page.evaluate(() => getComputedStyle(document.body).paddingTop)

    // base（手機）較緊湊、寬螢幕增強 → desktop 外距大於 mobile
    expect(parseFloat(desktopPad)).toBeGreaterThan(parseFloat(mobilePad))
  })

  test('manifest 具備「新增至主畫面」所需的可安裝欄位', async ({ request }) => {
    const res = await request.get('/manifest.json')
    expect(res.ok()).toBe(true)
    const m = await res.json()

    expect(m.name).toBeTruthy()
    expect(m.short_name).toBeTruthy()
    expect(m.start_url).toBeTruthy()
    expect(m.display).toBe('standalone')
    expect(m.theme_color).toBeTruthy()
    expect(m.background_color).toBeTruthy()

    // 圖示：須含 192 與 512，且至少一個 maskable（Android 自適應圖示）
    const sizes = m.icons.map((i) => i.sizes)
    expect(sizes).toContain('192x192')
    expect(sizes).toContain('512x512')
    const purposes = m.icons.flatMap((i) => (i.purpose || '').split(/\s+/))
    expect(purposes).toContain('maskable')
  })
})
