# 技術設計

## 決策 1：以「依分組決定比較基準」取代寫死的「每 100g」

現有管線把「每 100g」寫死在命名與邏輯中（`pricePer100g`、`unitPricePer100`、`currentPricePer100`）。件數類的比較基準是「每 1 件」、且不換算為克，無法套用同一條公式。

**選擇**：不為件數另接平行管線，而是把「比較基準」抽象為依單位所屬分組決定：

| 分組 | 基準 | 公式 |
| --- | --- | --- |
| weight | 每 100g | `price*rate / grams * 100` |
| volume | 每 100ml | `price*rate / ml * 100` |
| count | 每 1 件 | `price*rate / quantity` |

「同組內挑單價最低者」的評選邏輯三組共用，分組間不互比，故各組基準單位不同並無妨。

**否決**：把「個」當數量倍率（仍算每 100g）——與使用者「10 個 60 元 vs 1 個 6 元（無重量）」的心智模型不符。

## 決策 2：以 `UNIT_META` 統一單位中繼資料

`calc.js` 新增單一資料來源 `UNIT_META`：

```js
const UNIT_META = {
  g:  { category: 'weight', grams: 1 },
  kg: { category: 'weight', grams: 1000 },
  oz: { category: 'weight', grams: 28.3495 },
  lb: { category: 'weight', grams: 453.592 },
  ml: { category: 'volume', grams: 1 },
  l:  { category: 'volume', grams: 1000 },
  個: { category: 'count' },          // 無 grams：基準量即件數
}
```

新函式 `unitPrice({ price, rate, quantity, unit })` 取代 `unitPricePer100`：count 回 `price*rate/quantity`，其餘回 per-100。`history.js` 的 `unitCategory` 改讀 `UNIT_META`。

## 決策 3：欄位正名（A 方案）

件數類使舊名變成「謊話」，趁本次 TDD（測試本就要改）一併正名：

| 舊名 | 新名 |
| --- | --- |
| `unitPricePer100()` | `unitPrice()` |
| `weight`（輸入欄位） | `quantity` |
| `snapshot.pricePer100` | `snapshot.unitPrice`（並加 `snapshot.basis`） |
| `currentPricePer100` | `currentUnitPrice` |

`basis` 取值 `'每100g' | '每100ml' | '每件'`，供 UI 顯示與當時價回顧。

## 決策 4：純台幣（TWD）= 幣別下拉選項，而非獨立模式

幣別下拉新增 `TWD`，`DEFAULT_RATES` 補 `TWD: 1`。選 TWD 時：匯率鎖 1、隱藏匯率狀態列、不發更新請求。計算層無需特例（`rate=1` 天然成立），改動集中在 `main.js` 的 UI 顯隱。

**否決**：獨立「免匯率」模式開關——UI 改動更大，且與「幣別」概念重複。

## 決策 5：件數驗證為正整數

件數類數量須為正整數（雞蛋不能買 2.5 顆）。在現有「有限正數」驗證上，針對 `category === 'count'` 追加 `Number.isInteger` 檢查。重量／容量類仍允許小數。

## 受影響範圍

`js/calc.js`、`js/history.js`、`js/main.js`、對應 `js/*.test.js`、`e2e/`（新增按件與純台幣 E2E）。純前端零建置，不影響部署。
