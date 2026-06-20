## ADDED Requirements

### Requirement: Service Worker 註冊與靜態快取
系統應（SHALL）註冊一個 Service Worker，用以攔截網路請求，並在離線時提供快取的靜態資源。
快取的資源應包括：
- `index.html`（仍須快取以供離線回退，但採網路優先策略，詳見「快取版本管理與更新」需求）
- `css/style.css`
- `js/app.js`
- `js/exchange-rate.js`
- `manifest.json`
- PWA 圖示檔（`manifest.json` 所引用的 icon，確保離線安裝時圖示可用）

#### Scenario: 離線載入應用程式
- **WHEN** 瀏覽器無網路連線且使用者導航至應用程式網址時
- **THEN** 系統應使用快取的靜態資源載入頁面，並正常顯示使用者介面

### Requirement: 快取版本管理與更新
系統應（SHALL）以版本號管理靜態資源快取，確保部署新版後使用者能即時取得更新，不被舊快取卡住。
- 快取名稱以版本號命名（如 `price-calc-v1`），每次部署新版即遞增版本號。
- Service Worker `activate` 事件應清除所有非當前版本的舊快取。
- `index.html` 採「網路優先（Network-First）」策略，連線可用時優先取得最新版本，離線時才回退至快取。

#### Scenario: 部署新版後更新快取
- **WHEN** 開發者部署了新版本（版本號遞增）且使用者重新連線開啟應用程式
- **THEN** Service Worker 應安裝新版快取、清除舊版快取，使用者取得最新的程式碼

#### Scenario: 離線時回退至快取
- **WHEN** 使用者在離線狀態開啟應用程式
- **THEN** 系統應回退使用已快取的靜態資源正常載入

### Requirement: 可安裝的 PWA 設定檔 (Manifest)
系統應（SHALL）提供一個 `manifest.json` 設定檔，使應用程式可被安裝至使用者的行動裝置上。

#### Scenario: 手機安裝提示
- **WHEN** 使用者在相容的手機瀏覽器（如 iOS Safari 或 Android Chrome）中訪問本網站時
- **THEN** 系統應支援並允許使用者將此網頁「新增至主畫面」作為獨立 App

### Requirement: 行動優先響應式版面
系統介面應（SHALL）採用行動優先的設計思維，確保在手機小螢幕上仍具備高度易讀性與好點擊的觸控元件。

#### Scenario: 螢幕尺寸自適應調整
- **WHEN** 螢幕寬度小於 600px（標準智慧型手機）時
- **THEN** 系統應將輸入欄位垂直排列、按鈕寬度設為滿版，並調整字型大小，以便利單手操作與閱讀
