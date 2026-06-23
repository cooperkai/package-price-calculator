import { test, expect } from '@playwright/test'

// PWA 離線支援 E2E（task 6.2 / 對應 5.3 Service Worker、1.3 manifest）。
// 驗證：SW 註冊與啟用、靜態資源預快取、斷網後仍能由快取載入並運作。

/** 等 Service Worker 就緒並取得啟用中的註冊。 */
async function waitForServiceWorker(page) {
  await page.evaluate(() => navigator.serviceWorker.ready)
  return page.evaluate(async () => {
    const reg = await navigator.serviceWorker.getRegistration()
    return !!(reg && reg.active)
  })
}

test.describe('PWA 離線支援（task 6.2）', () => {
  test('Service Worker 註冊並以版本號預快取靜態資源', async ({ page }) => {
    await page.goto('/')
    expect(await waitForServiceWorker(page)).toBe(true)

    const cache = await page.evaluate(async () => {
      const names = await caches.keys()
      const c = await caches.open(names[0])
      const has = async (p) => !!(await c.match(p))
      return {
        names,
        index: await has('./index.html'),
        main: await has('./js/main.js'),
        exchange: await has('./js/exchange-rate.js'),
        manifest: await has('./manifest.json'),
        icon: await has('./icons/icon-192.png'),
      }
    })

    // 快取名稱以版本號命名（price-calc-<git 短雜湊>，由 npm run bump-sw 寫入）
    expect(cache.names).toHaveLength(1)
    expect(cache.names[0]).toMatch(/^price-calc-[0-9a-f]{7,40}$/)
    // 關鍵資源都已預快取
    expect(cache.index).toBe(true)
    expect(cache.main).toBe(true)
    expect(cache.exchange).toBe(true)
    expect(cache.manifest).toBe(true)
    expect(cache.icon).toBe(true)
  })

  test('manifest 與圖示被頁面正確連結', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('link[rel=manifest]')).toHaveAttribute('href', 'manifest.json')
    await expect(page.locator('link[rel=apple-touch-icon]')).toHaveAttribute('href', /icon-192\.png/)
  })

  test('斷網後重新載入仍能由快取運作', async ({ page, context }) => {
    await page.goto('/')
    expect(await waitForServiceWorker(page)).toBe(true)

    // 斷網
    await context.setOffline(true)
    await page.reload({ waitUntil: 'load' })

    // 頁面仍正常呈現
    await expect(page).toHaveTitle(/比價助手/)
    await expect(page.locator('h1')).toContainText('比價助手')

    // 模組腳本也來自快取 → 功能仍可用（計算單價）
    await page.fill('#price', '10')
    await page.fill('#amount', '500')
    await page.fill('#rate', '31.25')
    await page.click('#calc-btn')
    await expect(page.locator('#result')).toContainText('每 100g：NT$ 62.5')
  })
})
