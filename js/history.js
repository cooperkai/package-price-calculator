// 比價歷史（TDD：此刻為空殼，先讓測試亮紅燈，再實作）
// 對應 openspec comparison-history 規格；task 4.2 / 4.3 實作至綠燈。

/**
 * 判斷單位屬於重量類（g/kg/oz/lb）或容量類（ml/l）。
 * @param {string} unit
 * @returns {'weight'|'volume'}
 */
export function unitCategory(unit) {
  // TODO: 尚未實作（紅燈）
}

/**
 * 由原始輸入建立比價項目，含「當時價」快照（當時匯率與當時單價）。
 * @param {{name:string, price:number, currency:string, weight:number, unit:string, rate:number, timestamp:number}} input
 * @param {number} index 名稱為空時的預設編號
 * @returns {object}
 */
export function createItem(input, index) {
  // TODO: 尚未實作（紅燈）
}

/**
 * 依單位類型將項目分為重量類與容量類兩組。
 * @param {object[]} items
 * @returns {{weight: object[], volume: object[]}}
 */
export function groupByCategory(items) {
  // TODO: 尚未實作（紅燈）
}

/**
 * 以當前匯率即時重算各項目單價，並於各分組內標記最划算（isBestDeal）。
 * @param {object[]} items
 * @param {Record<string, number>} rates 當前匯率表（幣別 → 正向匯率）
 * @returns {object[]} 附帶 currentPricePer100 與 isBestDeal 的新項目陣列
 */
export function evaluate(items, rates) {
  // TODO: 尚未實作（紅燈）
}
