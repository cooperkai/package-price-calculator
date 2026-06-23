import { test, expect } from '@playwright/test'

// 純台幣免匯率 E2E（task 10.2）：選 TWD 隱藏匯率欄位、以匯率 1 直接比價。
// 對應 unit-price-calculator 規格「純台幣（TWD）免匯率換算」需求。

test.describe('純台幣免匯率（task 10.2）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('選 TWD → 隱藏匯率欄位；切回外幣 → 還原', async ({ page }) => {
    await expect(page.locator('#rate-field')).toBeVisible()
    await page.selectOption('#currency', 'TWD')
    await expect(page.locator('#rate-field')).toBeHidden()
    await page.selectOption('#currency', 'USD')
    await expect(page.locator('#rate-field')).toBeVisible()
  })

  test('215g/25 vs 230g/30 → 前者每 100g 較低、最划算', async ({ page }) => {
    await page.selectOption('#currency', 'TWD')

    await page.fill('#item-name', '甲')
    await page.fill('#price', '25')
    await page.fill('#amount', '215')
    await page.click('#add-btn')
    await expect(page.locator('#result')).toContainText('每 100g：NT$ 11.63')

    await page.fill('#item-name', '乙')
    await page.fill('#price', '30')
    await page.fill('#amount', '230')
    await page.click('#add-btn')

    // 甲 11.63 < 乙 13.04 → 甲最划算
    const best = page.locator('#history tr.best')
    await expect(best).toHaveCount(1)
    await expect(best).toContainText('甲')
  })
})
