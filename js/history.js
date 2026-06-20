// 比價歷史
// 對應 openspec comparison-history 規格：分組、即時重算、最划算評選、當時價快照。

import { unitPricePer100 } from './calc.js'

// 各單位所屬的比較分組（重量類以每 100g、容量類以每 100ml 比較）
const CATEGORY_BY_UNIT = {
  g: 'weight',
  kg: 'weight',
  oz: 'weight',
  lb: 'weight',
  ml: 'volume',
  l: 'volume',
}

/**
 * 判斷單位屬於重量類（g/kg/oz/lb）或容量類（ml/l）。
 * @param {string} unit
 * @returns {'weight'|'volume'}
 */
export function unitCategory(unit) {
  const category = CATEGORY_BY_UNIT[unit]
  if (category === undefined) throw new Error(`未知單位: ${unit}`)
  return category
}

/**
 * 由原始輸入建立比價項目，含「當時價」快照（當時匯率與當時單價）。
 * @param {{name:string, price:number, currency:string, weight:number, unit:string, rate:number, timestamp:number}} input
 * @param {number} index 名稱為空時的預設編號
 * @returns {object}
 */
export function createItem(input, index) {
  const { name, price, currency, weight, unit, rate, timestamp } = input
  return {
    name: name?.trim() ? name.trim() : `項目 ${index}`,
    price,
    currency,
    weight,
    unit,
    timestamp,
    category: unitCategory(unit),
    // 當時價快照：永久不變，僅供回顧，不作為排名依據
    snapshot: {
      rate,
      pricePer100: unitPricePer100({ price, rate, weight, unit }),
    },
  }
}

/**
 * 依單位類型將項目分為重量類與容量類兩組。
 * @param {object[]} items
 * @returns {{weight: object[], volume: object[]}}
 */
export function groupByCategory(items) {
  const grouped = { weight: [], volume: [] }
  for (const item of items) {
    grouped[unitCategory(item.unit)].push(item)
  }
  return grouped
}

/**
 * 以當前匯率即時重算各項目單價，並於各分組內標記最划算（isBestDeal）。
 * @param {object[]} items
 * @param {Record<string, number>} rates 當前匯率表（幣別 → 正向匯率）
 * @returns {object[]} 附帶 currentPricePer100 與 isBestDeal 的新項目陣列
 */
export function evaluate(items, rates) {
  // 以當前匯率重算每個項目的單價（非用當時快照）
  const recomputed = items.map((item) => ({
    ...item,
    currentPricePer100: unitPricePer100({
      price: item.price,
      rate: rates[item.currency],
      weight: item.weight,
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
      if (item.currentPricePer100 < best.currentPricePer100) best = item
    }
    best.isBestDeal = true
  }

  return recomputed
}
