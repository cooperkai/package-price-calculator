import { test, expect } from '@playwright/test'

// 完整使用者流程 E2E（task 6.1）：輸入 → 計算 → 加入比價列表 → 最划算高亮。
// 對應 comparison-history / unit-price-calculator 規格的端到端行為。

/** 填入表單一個商品並點「加入比價列表」。 */
async function addItem(page, { name, price, currency = 'USD', amount, unit = 'g', rate }) {
  await page.fill('#item-name', name)
  await page.fill('#price', String(price))
  await page.selectOption('#currency', currency)
  await page.fill('#amount', String(amount))
  await page.selectOption('#unit', unit)
  await page.fill('#rate', String(rate))
  await page.click('#add-btn')
}

test.describe('使用者比價流程（task 6.1）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('計算單價並顯示每 100g 結果', async ({ page }) => {
    // (10 外幣 × 31.25 ÷ 500g) × 100 = 62.5
    await page.fill('#price', '10')
    await page.fill('#amount', '500')
    await page.fill('#rate', '31.25')
    await page.click('#calc-btn')
    await expect(page.locator('#result')).toContainText('每 100g：NT$ 62.5')
  })

  test('加入兩項並高亮最划算（較便宜者）', async ({ page }) => {
    await expect(page.locator('#history')).toContainText('尚無項目')

    await addItem(page, { name: 'A牌', price: 10, amount: 500, rate: 31.25 }) // 62.5
    await addItem(page, { name: 'B牌', price: 8, amount: 300, rate: 31.25 })  // 83.33

    const rows = page.locator('#history tbody tr')
    await expect(rows).toHaveCount(2)

    // 最划算 = A牌：唯一帶 .best 的列，且含「最划算」標籤
    const bestRow = page.locator('#history tr.best')
    await expect(bestRow).toHaveCount(1)
    await expect(bestRow).toContainText('A牌')
    await expect(bestRow.locator('.tag')).toHaveText('最划算')

    // B牌非最划算：該列無「最划算」標籤
    const bRow = page.locator('#history tbody tr', { hasText: 'B牌' })
    await expect(bRow.locator('.tag')).toHaveCount(0)
  })

  test('重量類與容量類分組、各組獨立評選最划算', async ({ page }) => {
    await addItem(page, { name: '重A', price: 10, amount: 500, unit: 'g', rate: 31.25 })  // 62.5（重量）
    await addItem(page, { name: '重B', price: 8, amount: 300, unit: 'g', rate: 31.25 })   // 83.33（重量）
    await addItem(page, { name: '容A', price: 5, amount: 1000, unit: 'ml', rate: 31.25 }) // 15.63（容量）

    // 兩個分組標題各自出現
    await expect(page.locator('#history')).toContainText('重量類')
    await expect(page.locator('#history')).toContainText('容量類')

    // 不跨組：最划算共兩個（重量組的重A、容量組的容A，各自唯一）
    const best = page.locator('#history tr.best')
    await expect(best).toHaveCount(2)
    await expect(best.filter({ hasText: '重A' })).toHaveCount(1)
    await expect(best.filter({ hasText: '容A' })).toHaveCount(1)
  })

  test('刪除單項與一鍵清空', async ({ page }) => {
    await addItem(page, { name: 'A牌', price: 10, amount: 500, rate: 31.25 })
    await addItem(page, { name: 'B牌', price: 8, amount: 300, rate: 31.25 })
    await expect(page.locator('#history tbody tr')).toHaveCount(2)

    // 刪除 A牌 → 剩 B牌
    await page.locator('#history tbody tr', { hasText: 'A牌' }).locator('.del').click()
    await expect(page.locator('#history tbody tr')).toHaveCount(1)
    await expect(page.locator('#history')).toContainText('B牌')

    // 一鍵清空 → 回到空狀態
    await page.click('#clear-btn')
    await expect(page.locator('#history')).toContainText('尚無項目')
  })
})
