import { defineConfig } from 'vitest/config'

// 單元測試範圍（task 1.4）：只收 js/ 下的 *.test.js（純邏輯層）。
// E2E 的 e2e/*.spec.js 交由 Playwright（playwright.config.js）執行，兩者不重疊。
export default defineConfig({
  test: {
    include: ['js/**/*.test.js'],
  },
})
