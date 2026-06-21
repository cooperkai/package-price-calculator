import { defineConfig, devices } from '@playwright/test'

// E2E 設定（task 1.4）：以 Playwright 跑整合層測試。
// 純靜態站點，啟動前自動以 Node 起一個本機靜態伺服器（tools/serve.mjs，零額外依賴、免 Python），
// 測試結束自動關閉；CI 與本機皆可用。實際 E2E 案例見 task 6.x。
const PORT = 8123
const BASE_URL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: `node tools/serve.mjs ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
  },
})
