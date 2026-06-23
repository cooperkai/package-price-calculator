// 計算引擎

/**
 * 單位中繼資料：所屬比較分組與（重量／容量類的）每單位克數。
 * 比較基準依分組決定——weight/volume 比每 100 基準單位，count 比每 1 件。
 * 件數類（個）無 grams，基準量即件數本身。
 */
export const UNIT_META = {
  g: { category: 'weight', grams: 1 },
  kg: { category: 'weight', grams: 1000 },
  oz: { category: 'weight', grams: 28.3495 },
  lb: { category: 'weight', grams: 453.592 },
  ml: { category: 'volume', grams: 1 },
  l: { category: 'volume', grams: 1000 },
  個: { category: 'count' },
}

/**
 * 將重量／容量換算為克。
 * @param {number} value 數量
 * @param {'g'|'kg'|'oz'|'lb'|'ml'|'l'} unit 單位
 * @returns {number} 對應的克數
 */
export function toGrams(value, unit) {
  const meta = UNIT_META[unit]
  if (meta === undefined || meta.grams === undefined) throw new Error(`未知單位: ${unit}`)
  return value * meta.grams
}

/**
 * 四捨五入至小數點後 2 位。
 * @param {number} value
 * @returns {number}
 */
function round2(value) {
  return Math.round(value * 100) / 100
}

/**
 * 計算每 100 克（或 100 毫升）的台幣單價。
 * @param {{ price: number, rate: number, grams: number }} input
 *   price 外幣價格、rate 正向匯率（1 外幣 = N 台幣）、grams 已換算為克的重量
 * @returns {number} 四捨五入至小數點後 2 位的每 100g 台幣單價
 */
export function pricePer100g({ price, rate, grams }) {
  // 每 100 克價格 = (外幣價格 * 正向匯率 / 重量克數) * 100，四捨五入至 2 位
  return round2((price * rate / grams) * 100)
}

/**
 * 由原始輸入算出該單位所屬分組的台幣比較單價。
 * 重量／容量類回每 100g／100ml 單價；件數類（個）回每 1 件單價。
 * @param {{ price: number, rate: number, quantity: number, unit: string }} input
 * @returns {number} 四捨五入至小數點後 2 位的台幣比較單價
 */
export function unitPrice({ price, rate, quantity, unit }) {
  const meta = UNIT_META[unit]
  if (meta === undefined) throw new Error(`未知單位: ${unit}`)
  // 件數類：每 1 件單價 = 價格 * 匯率 / 件數
  if (meta.category === 'count') return round2(price * rate / quantity)
  // 重量／容量類：每 100 基準單位單價
  return pricePer100g({ price, rate, grams: toGrams(quantity, unit) })
}
