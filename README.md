# 🛒 比價助手 - 單位價格與匯率換算器 (Package Price Calculator)

這個網頁應用程式是一個專門為日常購物設計的輕量、美觀且具備離線使用功能的手機版網頁工具。它可以幫助您快速將各種不同包裝容量、不同外幣計價的商品，統一換算成**每 100 公克（或 100 毫升）台幣（TWD）**的價格，以便在購物時輕鬆找出最划算的選擇！

## ✨ 主要功能特點

1. **單位換算與計算引擎**
   - 支援將多種重量/容量單位（克 `g`、公斤 `kg`、盎司 `oz`、磅 `lb`、毫升 `ml`、公升 `l`）自動標準化。
   - 計算公式：`每 100g 價格 = (外幣價格 * 當天匯率 / 換算後的克數) * 100`。
2. **即時匯率取得與快取**
   - 自動向免費且無須金鑰的 API 取得當日最新匯率（以台幣 TWD 為基準）。
   - 將匯率快取於瀏覽器的 `localStorage` 中。即使在沒有網路的超市地下室，也能使用最後一次更新的匯率進行換算。
   - 支援手動調整匯率以因應即時匯率波動或手續費加成。
3. **多商品排版比價**
   - 支援輸入商品名稱並將計算結果新增至比價列表中。
   - 自動比對所有項目，並以綠色底色與「最划算」標籤高亮最便宜的商品。
   - 提供單項刪除與一鍵清除歷史記錄的功能。
4. **離線存取與 PWA 支援**
   - 透過 Service Worker 快取網頁靜態資源，無網路時亦能瞬間載入。
   - 支援 Progressive Web App (PWA)，可「新增至主畫面」當作獨立 App 使用：**iOS 需用 Safari**（Apple 限制，Chrome 等第三方瀏覽器在 iOS 沒有此選項）、**Android 用 Chrome** 即可安裝。
5. **精美現代化介面**
   - 採用毛玻璃效果（Glassmorphism）與深色主題（Dark Mode），提供質感出色的視覺體驗。
   - 針對單手操作設計的響應式版面，非常適合在購物賣場中邊走邊算。

---

## 🛠️ 技術棧 (Tech Stack)

純前端、**零框架、零建置**，刻意維持與 GitHub Pages 的最大相容性與極速載入。

**前端**
- 原生 **HTML5**
- 原生 **CSS3**：CSS 變數（自訂屬性）、Flexbox／Grid、`backdrop-filter` 毛玻璃、深色主題、行動優先媒體查詢；系統字型堆疊（不載入任何網路字型）
- 原生 **JavaScript（ES Modules, ES6+）**：純邏輯與 DOM 操作分離，瀏覽器原生載入、不打包

**PWA 與離線**
- **Web App Manifest**（可安裝、獨立視窗）
- **Service Worker**：版本化快取、`index.html` 網路優先、靜態資源快取優先
- **localStorage**：比價列表與匯率快取持久化

**資料來源**
- 匯率多來源降級鏈：**ExchangeRate-API**（`open.er-api.com`）→ **@fawazahmed0/currency-api**（jsDelivr CDN）→ 本地快取 → 內建預設值

**測試**
- **Vitest**：純邏輯單元測試（測試先行 TDD）
- **Playwright**：UI／離線／響應式 E2E

**開發 / 部署工具**
- **Node.js**：本機靜態伺服器（`tools/serve.mjs`）、SW 版本 stamp（`tools/bump-sw.mjs`），皆零第三方依賴
- **GitHub Pages + GitHub Actions**：自動部署
- **OpenSpec**：規格／設計／任務管理流程

---

## 📂 專案架構與規格文件

本專案使用 **OpenSpec** 規範進行開發，所有的規格、設計及任務清單皆已編寫完畢：

- **變更提案 (Proposal)**: `openspec/changes/price-calculator/proposal.md`
  - 記錄了專案的緣由、功能範疇與核心能力模組。
- **功能規格 (Specs)**: `openspec/changes/price-calculator/specs/`
  - [計算引擎規格](openspec/changes/price-calculator/specs/unit-price-calculator/spec.md)
  - [匯率服務規格](openspec/changes/price-calculator/specs/exchange-rate-service/spec.md)
  - [比價歷史規格](openspec/changes/price-calculator/specs/comparison-history/spec.md)
  - [離線與 PWA 規格](openspec/changes/price-calculator/specs/pwa-offline-support/spec.md)
- **技術設計 (Design)**: `openspec/changes/price-calculator/design.md`
  - 詳細說明了離線架構、資料持久化、外接 API 的設計決定與風險評估。
- **任務清單 (Tasks)**: `openspec/changes/price-calculator/tasks.md`
  - 拆解出具體開發時的各個步驟。

---

## 🧪 本地開發與測試

> ⚠️ **只是想使用 App** 的話不需要這一段——本網站是純靜態 HTML/CSS/JS，瀏覽 GitHub Pages（或任何 `http://` 來源）即可，無須安裝任何東西。
> 注意：頁面採用 ES modules，**不能用 `file://` 直接雙擊開啟 `index.html`**（瀏覽器會以 CORS 阻擋模組載入）；本機預覽請起一個簡易靜態伺服器。本專案內建一個零依賴的 Node 伺服器：
> ```bash
> npm run dev            # → http://127.0.0.1:8123/（Ctrl+C 停）
> npm run dev -- 8124    # 換 port
> ```
> 沒有 Node 也可改用 Python：`python -m http.server 8000`（然後開 http://127.0.0.1:8000/）。
> 部署到 GitHub Pages 走的是 `http://`，不受此限。以下僅針對**要跑測試或參與開發**的情境。

**需求**
- Node.js **>= 22.12.0**（專案附 `.nvmrc`，使用 nvm 者可直接 `nvm use`）

**步驟**
```bash
# 1. 還原開發依賴（node_modules 不在 repo 內，需自行安裝）
npm install

# 2. 跑單元測試（Vitest）
npm test

# 監看模式：存檔自動重跑
npm run test:watch

# 3. 首次跑 E2E 前，需下載 Playwright 瀏覽器（僅需一次，不會進 repo）
npx playwright install chromium

# 4. 跑 E2E（Playwright，會自動起本機靜態伺服器）
npm run test:e2e
```

測試採「測試先行（TDD）」：純邏輯（計算、單位換算、驗證、匯率、比價）以 Vitest 撰寫單元測試，UI／離線／響應式則交由 Playwright 進行 E2E。詳見 `openspec/changes/price-calculator/design.md` 決策 #5。

## 🚀 部署至 GitHub Pages

部署採 **GitHub Actions 自動化**（設定一次，之後全自動）：

1. **一次性設定**：repo **Settings → Pages → Build and deployment → Source** 選 **GitHub Actions**。
2. **日常部署**：把變更 **push／合併到 `main`** 即可。[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) 會自動：
   - 用 [`tools/bump-sw.mjs`](tools/bump-sw.mjs) 把 Service Worker 的快取版本 stamp 成此次 commit 的 git 短雜湊；
   - 組裝靜態網站並部署到 Pages。

> **為什麼要 stamp 版本**：靜態資源（CSS/JS）由 Service Worker「快取優先」，若每次部署不換版本號，已安裝的舊使用者會一直吃到舊快取、看不到更新。改由 Actions 自動處理，毋需人工記得換版本；快取名 `price-calc-<SHA>` 也能反查線上是哪一版程式碼。

本專案仍是**零建置**的純靜態站（HTML/CSS/JS）；Actions 只負責「stamp 版本 + 搬檔上線」，不做任何編譯打包。

### 📲 使用者怎麼拿到更新

合併到 `main` 自動部署後，**使用者什麼都不用做**——沒有 App Store、不用手動更新：

- **一般瀏覽器**：`index.html` 網路優先，一連網就是最新；CSS/JS 由新版 Service Worker 背景換掉，**通常「晚一個重整」就全新**。
- **已加到主畫面的 PWA（尤其 iOS）**：iOS 會冷凍背景 SW，有時要**有網路時把 App 從多工整個滑掉、再開一兩次**才更新到。
- **不需要重新加到桌面**：桌面圖示只是指向同一網址、走同一個 SW 的捷徑；**重加也不會強制更新**，真正決定版本的是 SW。要更新就「關掉重開」即可。
- **確認到新版了沒**：看「個 / TWD」等新選項在不在，或線上 `F12 → Application → Cache Storage` 的快取名 `price-calc-<SHA>` 對不對得上最新 commit。
