## 7. 計算引擎：基準一般化與件數每件單價

- [x] 7.1 `js/calc.js` 引入 `UNIT_META`（單位 → 分組＋克數）統一單位資料；`unitPrice({price, rate, quantity, unit})` 依分組計價——重量／容量回每 100g／100ml，件數「個」回每件單價（`price*rate/quantity`）。隨抽象正名 `unitPricePer100→unitPrice`、`weight→quantity`。案例：60 元 / 10 個 → 6.00、6 元 / 1 個 → 6.00、12 USD × 32.5 / 6 個 → 65.00；重量／容量既有期望值不變。

## 8. 比價歷史：三類分組

- [x] 8.1 `js/history.js` 的 `groupByCategory` 回傳 `{weight, volume, count}` 三組；`evaluate` 涵蓋件數組（組內以每件單價挑最低、不跨組）；`createItem` 正名（`quantity`、`currentUnitPrice`）並於快照帶 `snapshot.basis`（每100g／每100ml／每件）。
- [x] 8.2 件數正整數驗證：單位為「個」時數量須為正整數，小數／零／負值視為無效並停用計算與加入。

## 9. UI 接線

- [ ] 9.1 `js/main.js`：單位下拉加「個」；選件數類時輸入標籤改「數量」、結果與當時價顯示「每件 X 元」；`render` 加件數類區塊並同步欄位正名（`currentUnitPrice`、`snapshot.unitPrice`）。
- [ ] 9.2 純台幣免匯率：`DEFAULT_RATES` 補 `TWD: 1`、幣別下拉加「TWD」；選 TWD 時匯率鎖 1、隱藏匯率狀態列、不發匯率更新請求，切回外幣還原。

## 10. E2E 與收尾

- [ ] 10.1 Playwright E2E：按件比價完整流程（輸入「個」→ 每件單價 → 加入 → 組內高亮、與重量類互不影響）。
- [ ] 10.2 Playwright E2E：純台幣比價（選 TWD → 匯率列隱藏 → 215g/25 vs 230g/30 高亮前者）。
- [ ] 10.3 部署前確認：`npm test` 與 `npm run test:e2e` 全綠；實機抽驗按件與純台幣情境。
