// 比價歷史
// 對應 openspec comparison-history 規格：分組、即時重算、最划算評選、當時價快照。

import { unitPrice, UNIT_META } from './calc.js'

// 各分組的比較基準標示（供 UI 顯示與當時價回顧）
const BASIS_LABEL = {
  weight: '每100g',
  volume: '每100ml',
  count: '每件',
}

/**
 * 判斷單位所屬分組（weight／volume／count）。
 * @param {string} unit
 * @returns {'weight'|'volume'|'count'}
 */
export function unitCategory(unit) {
  const meta = UNIT_META[unit]
  if (meta === undefined) throw new Error(`未知單位: ${unit}`)
  return meta.category
}

/**
 * 由原始輸入建立比價項目，含「當時價」快照（當時匯率、當時單價與分組基準）。
 * @param {{name:string, price:number, currency:string, quantity:number, unit:string, rate:number, timestamp:number}} input
 * @param {number} index 名稱為空時的預設編號
 * @returns {object}
 */
export function createItem(input, index) {
  const { name, price, currency, quantity, unit, rate, timestamp } = input
  const category = unitCategory(unit)
  return {
    name: name?.trim() ? name.trim() : `項目 ${index}`,
    price,
    currency,
    quantity,
    unit,
    timestamp,
    category,
    // 當時價快照：永久不變，僅供回顧，不作為排名依據
    snapshot: {
      rate,
      unitPrice: unitPrice({ price, rate, quantity, unit }),
      basis: BASIS_LABEL[category],
    },
  }
}

/**
 * 依單位類型將項目分為重量類、容量類與件數類三組。
 * @param {object[]} items
 * @returns {{weight: object[], volume: object[], count: object[]}}
 */
export function groupByCategory(items) {
  const grouped = { weight: [], volume: [], count: [] }
  for (const item of items) {
    grouped[unitCategory(item.unit)].push(item)
  }
  return grouped
}

/**
 * 以當前匯率即時重算各項目單價，並於各分組內標記最划算（isBestDeal）。
 * @param {object[]} items
 * @param {Record<string, number>} rates 當前匯率表（幣別 → 正向匯率）
 * @returns {object[]} 附帶 currentUnitPrice 與 isBestDeal 的新項目陣列
 */
export function evaluate(items, rates) {
  // 以當前匯率重算每個項目的單價（非用當時快照）
  const recomputed = items.map((item) => ({
    ...item,
    currentUnitPrice: unitPrice({
      price: item.price,
      rate: rates[item.currency],
      quantity: item.quantity,
      unit: item.unit,
    }),
    isBestDeal: false,
  }))

  // 各分組內各自找最低者高亮，不跨組
  const grouped = groupByCategory(recomputed)
  for (const group of Object.values(grouped)) {
    if (group.length === 0) continue
    let best = group[0]
    for (const item of group) {
      if (item.currentUnitPrice < best.currentUnitPrice) best = item
    }
    best.isBestDeal = true
  }

  return recomputed
}
