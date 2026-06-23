import { test, expect } from '@playwright/test'

// 按件比價 E2E（task 10.1）：單位「個」每件單價、件數類分組、與重量類互不影響。
// 對應 unit-price-calculator / comparison-history 規格的件數相關 Scenario。

/** 填表並加入比價列表（TWD 免匯率時跳過匯率欄位，因其已隱藏）。 */
async function addItem(page, { name = '', price, currency = 'USD', amount, unit, rate }) {
  await page.fill('#item-name', name)
  await page.selectOption('#currency', currency)
  await page.selectOption('#unit', unit)
  await page.fill('#price', String(price))
  await page.fill('#amount', String(amount))
  if (currency !== 'TWD') await page.fill('#rate', String(rate))
  await page.click('#add-btn')
}

test.describe('按件比價（task 10.1）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('選「個」→ 標籤改「數量（件）」並算每件單價', async ({ page }) => {
    await page.selectOption('#unit', '個')
    await expect(page.locator('#amount-label')).toHaveText('數量（件）')

    await page.selectOption('#currency', 'TWD')
    await page.fill('#price', '60')
    await page.fill('#amount', '10')
    await page.click('#calc-btn')
    await expect(page.locator('#result')).toContainText('每 件：NT$ 6')
  })

  test('外幣按件：12 USD × 32.5 ÷ 6 → 每件 65', async ({ page }) => {
    await page.selectOption('#unit', '個')
    await page.fill('#price', '12')
    await page.fill('#amount', '6')
    await page.fill('#rate', '32.5')
    await page.click('#calc-btn')
    await expect(page.locator('#result')).toContainText('每 件：NT$ 65')
  })

  test('件數組內挑每件最低、不與重量類混比', async ({ page }) => {
    await addItem(page, { name: '大盒蛋', price: 60, currency: 'TWD', amount: 10, unit: '個' }) // 每件 6
    await addItem(page, { name: '小盒蛋', price: 30, currency: 'TWD', amount: 6, unit: '個' }) // 每件 5 ← 件數組最划算
    await addItem(page, { name: '白米', price: 25, currency: 'TWD', amount: 215, unit: 'g' }) // 重量組，自成最划算

    await expect(page.locator('#history')).toContainText('件數類')
    await expect(page.locator('#history')).toContainText('重量類')

    // 不跨組：件數組（小盒蛋）與重量組（白米）各一個最划算
    const best = page.locator('#history tr.best')
    await expect(best).toHaveCount(2)
    await expect(best.filter({ hasText: '小盒蛋' })).toHaveCount(1)
    await expect(best.filter({ hasText: '白米' })).toHaveCount(1)
    await expect(best.filter({ hasText: '大盒蛋' })).toHaveCount(0)
  })
})
