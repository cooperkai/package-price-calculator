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
   - 支援 Progressive Web App (PWA)，可在手機瀏覽器（Safari / Chrome）中點選「新增至主畫面」當作獨立 App 使用。
5. **精美現代化介面**
   - 採用毛玻璃效果（Glassmorphism）與深色主題（Dark Mode），提供質感出色的視覺體驗。
   - 針對單手操作設計的響應式版面，非常適合在購物賣場中邊走邊算。

---

## 📂 專案架構與規格文件

本專案使用 **OpenSpec** 規範進行開發，所有的規格、設計及任務清單皆已編寫完畢：

- **變更提案 (Proposal)**: `openspec/changes/price-calculator/proposal.md`
  - 記錄了專案的緣由、功能範疇與核心能力模組。
- **功能規格 (Specs)**: `openspec/changes/price-calculator/specs/`
  - [計算引擎規格](file:///d:/code/package-price-calculator/openspec/changes/price-calculator/specs/unit-price-calculator/spec.md)
  - [匯率服務規格](file:///d:/code/package-price-calculator/openspec/changes/price-calculator/specs/exchange-rate-service/spec.md)
  - [比價歷史規格](file:///d:/code/package-price-calculator/openspec/changes/price-calculator/specs/comparison-history/spec.md)
  - [離線與 PWA 規格](file:///d:/code/package-price-calculator/openspec/changes/price-calculator/specs/pwa-offline-support/spec.md)
- **技術設計 (Design)**: `openspec/changes/price-calculator/design.md`
  - 詳細說明了離線架構、資料持久化、外接 API 的設計決定與風險評估。
- **任務清單 (Tasks)**: `openspec/changes/price-calculator/tasks.md`
  - 拆解出具體開發時的各個步驟。

---

## 🚀 部署至 GitHub Pages

由於本專案完全基於靜態網頁技術（純 HTML, CSS, JavaScript），沒有任何建置或編譯步驟，您可以直接將程式碼上傳至 GitHub 儲存庫，並在儲存庫的 **Settings > Pages** 中開啟 GitHub Pages 服務，即可獲得一個專屬的網頁連結在手機上使用！
