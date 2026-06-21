import { test, expect } from '@playwright/test'

// 冒煙測試（task 1.4）：僅驗證 E2E 環境本身可運作——頁面載入、標題正確、無 console error。
// 完整使用者流程／離線／響應式等情境見 task 6.x。
test('首頁載入成功且標題正確', async ({ page }) => {
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))

  await page.goto('/')

  await expect(page).toHaveTitle(/比價助手/)
  await expect(page.locator('h1')).toContainText('比價助手')
  expect(errors).toEqual([])
})
