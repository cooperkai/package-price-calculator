## 1. 專案初始化與 HTML 結構

- [x] 1.1 建立基本的專案目錄結構（根目錄、`/css`、`/js`、圖示資料夾）。
  - 註：`css/`、`js/` 早已建立；本次補 `icons/`（`icon.svg` 來源 + `icon-192/512.png`，由 `tools/render-icons.mjs` 渲染）。
- [x] 1.2 在 `index.html` 中撰寫核心 HTML 結構，包含表單輸入項、歷史比價表格、以及腳本與樣式表的引入。
- [x] 1.3 建立用於 PWA 安裝與設定的 `manifest.json` 設定檔。
  - 註：`manifest.json`（名稱、short_name、display standalone、theme/background color、192/512 含 maskable 圖示），相對 `start_url`/`scope` 相容 GitHub Pages 子路徑；`index.html` 加 `link rel=manifest` 與 `apple-touch-icon`。
- [x] 1.4 建立測試環境：新增 `package.json`，安裝 dev 依賴 **Vitest**（單元測試）與 **Playwright**（E2E），設定 `npm test` 與 `npm run test:e2e` 指令；確認 `node_modules` 已被 `.gitignore` 排除、不影響靜態部署。
  - 註：`@playwright/test@1.61.0` 列入 devDependencies；新增 `playwright.config.js`（E2E 自動起本機靜態伺服器、testDir `e2e/`）與 `vitest.config.js`（單元只收 `js/**/*.test.js`，與 E2E `*.spec.js` 切開）。`e2e/smoke.spec.js` 冒煙測試驗證 `npm run test:e2e` 可跑。`.gitignore` 補排除 Playwright 產出物。`npm test` 54 綠、`npm run test:e2e` 1 綠。

## 2. 匯率服務實作（測試先行）

- [x] 2.1 **先寫單元測試（Vitest）**：依 `exchange-rate-service` 規格的 Scenario，覆蓋匯率正規化（取倒數→正向）、多來源降級鏈選源、請求節流（<24h 不請求）、手動鎖定與自動更新跳過、無效手動匯率拒絕；以 mock 模擬 `fetch`／`localStorage`（此時為紅燈）。
- [x] 2.2 在 `js/exchange-rate.js` 實作多來源降級鏈：主來源 (`open.er-api.com`) → 備援來源 (jsDelivr CDN 的 `@fawazahmed0/currency-api`) → 本地快取 → 寫死預設值，並正規化為「1 外幣 = N 台幣」正向格式；實作至測試通過。
  - 註：降級鏈順序與 `normalizeRate` 正規化已單元綠燈（`fetchWithFallback` 以注入假來源測）。真實來源 fetch 與寫死預設匯率表之整合串接改由 Playwright E2E 驗證。
- [x] 2.3 實作 `localStorage` 匯率快取與請求節流（時間戳記效期、快取未滿 24 小時不重新請求、單一來源失敗至多重試一次）；實作至測試通過。
  - 註：節流判斷 `isCacheFresh`（<24h）已單元綠燈。真實 `localStorage` 讀寫與單一來源重試一次之整合行為改由 Playwright E2E 驗證。
- [x] 2.4 新增手動調整／鎖定的 UI 控制項與邏輯（手動值驗證為正數、覆寫即鎖定使自動更新跳過、提供解除鎖定），並顯示「最後更新時間 / 可能過時 / 預設估計值」狀態提示；串接已測試通過的邏輯。
  - 註：新增純邏輯 `describeRateStatus`（來源＋時效 → fresh/stale/default 狀態）已單元綠燈。`main.js` 以 `DEFAULT_RATES` 種入每幣別匯率狀態，手動輸入即 `applyManualRate` 鎖定、提供解除鎖定還原預設，狀態列重用 `describeRateStatus` 與 `isValidManualRate`。真實線上 fetch、`mergeWithLocks` 自動更新串接與 `localStorage` 持久化屬整合層，交 Playwright E2E（task 6.x）。

## 3. 計算引擎實作（測試先行）

- [x] 3.1 **先寫單元測試（Vitest）**：將 `unit-price-calculator` 規格的 Scenario 逐條轉成測試——單位換算（kg/oz/lb/ml/l→g）、每 100g 計算、匯率正向正規化、四捨五入 2 位小數、輸入驗證（負值/零/空白/非數字/極大值）（此時紅燈）。
- [x] 3.2 在 `js/calc.js` 實作單位標準化函式（g, kg, oz, lb, ml, l → g）；實作至相關測試通過。
- [x] 3.3 實作貨幣轉換與每 100g 計算（含正向匯率正規化、四捨五入並固定 2 位小數）；實作至測試通過。
- [x] 3.4 實作輸入驗證（拒絕負值/零、空白、非數字字元、非有限/極大值溢位），通過才觸發計算；實作至測試通過。

## 4. 比價歷史紀錄管理（測試先行）

- [x] 4.1 **先寫單元測試（Vitest）**：依 `comparison-history` 規格 Scenario，覆蓋依單位類型分組（重量類/容量類）、以當前匯率即時重算、各組找最低（最划算）、匯率變動後重新排名、當時價快照保存（此時紅燈）。
- [x] 4.2 實作儲存項目資料結構（原始輸入＋加入時間戳記＋「當時匯率與當時 TWD/100g」快照）與 `localStorage` 同步；實作至測試通過。
  - 註：項目資料結構與「當時價」快照（`createItem`）已單元綠燈。真實 `localStorage` 同步之整合行為改由 Playwright E2E 驗證。
- [x] 4.3 實作分組、即時重算與「最划算」評選邏輯（依單位類型分組、不跨組、匯率變動自動重新排名）；實作至測試通過。
- [x] 4.4 實作歷史列表渲染、最划算綠色高亮、當時價回顧顯示、單項刪除與一鍵清空等 UI；串接已測試通過的邏輯。
  - 註：`js/main.js` 串接 `evaluate`/`groupByCategory` 渲染分組列表、最划算高亮、當時價快照、刪除與清空。實機互動與 localStorage 持久化之驗證屬整合層，交 Playwright E2E。

## 5. 樣式美化與 PWA 離線支援

- [x] 5.1 使用 CSS 變數設計現代化的 UI 主題（深色模式、毛玻璃卡片、響應式 Flex/Grid 版面），字型採系統字型堆疊（不載入任何網路字型）。
  - 註：`css/styles.css` 擴充 CSS 變數（色彩／間距尺度／圓角／過渡／陰影）；環境光漸層背景襯托毛玻璃模糊、卡片頂緣高光稜邊；標題漸層字、按鈕漸層＋hover 浮起、輸入框 focus 光暈與過渡、表格列 hover 與最划算左邊條高亮；系統字型堆疊（含 Noto Sans TC／PingFang TC／微軟正黑體）零網路字型；加 `prefers-reduced-motion` 關閉動態。純樣式無紅燈單元測試，視覺/響應式斷言交 task 6.3 E2E。手機媒體查詢見 task 5.2。
- [x] 5.2 撰寫行動優先的媒體查詢（Media Queries），以支援單手在手機上流暢操作。
  - 註：改為行動優先——`css/styles.css` 的 base 樣式以手機為準（緊湊內距、互動元件 `min-height: 44px` 觸控目標、輸入 ≥16px 避免 iOS 聚焦放大）；`@media (min-width: 600px)` 為平板／桌機加大留白與標題（向上增強）；`@media (max-width: 360px)` 壓縮欄距與表格字級避免擁擠。已用 Playwright 於 360/390/768 寬度截圖確認無溢出、觸控目標放大、寬螢幕回復寬鬆。視覺/響應式正式斷言交 task 6.3 E2E。
- [x] 5.3 撰寫 Service Worker (`sw.js`) 並在網頁中註冊，實現離線快取：以版本號命名快取、`activate` 時清除舊版號快取、`index.html` 採網路優先（Network-First）策略以便部署新版後即時更新。
  - 註：`sw.js` 快取名 `price-calc-v1`、install 預快取靜態資源、activate 清非當前版本、導航/`index.html` 網路優先其餘快取優先；`index.html` 以相對路徑註冊。整合行為由 `e2e/pwa.spec.js`（task 6.2）驗證。

## 6. E2E／UI 測試與部署準備

- [x] 6.1 撰寫 Playwright E2E：完整使用者流程（輸入 → 計算 → 加入比價列表 → 最划算高亮）。
  - 註：`e2e/user-flow.spec.js` 4 案——計算顯示每 100g、加兩項高亮最划算、重量/容量分組各自評選、刪除與一鍵清空。`npm run test:e2e` 全綠（含 smoke 共 5 passed）。
- [x] 6.2 撰寫 Playwright E2E：離線情境——Service Worker 快取後斷網仍能載入並正常運作。
  - 註：`e2e/pwa.spec.js` 3 案——SW 註冊與版本化預快取、manifest/圖示連結、斷網重載仍可載入並計算。`npm run test:e2e` 全綠（共 8 passed）。
- [ ] 6.3 撰寫 Playwright E2E／視覺檢查：響應式版面（<600px 手機）與 PWA 安裝（manifest、新增至主畫面）。
- [ ] 6.4 部署前確認：`npm test`（Vitest 單元）與 `npm run test:e2e`（Playwright）全綠，並於實機行動裝置抽驗。
