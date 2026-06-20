// 計算引擎

// 各單位對應的克數（ml/l 以密度 1g/ml 換算）
const GRAMS_PER_UNIT = {
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
  ml: 1,
  l: 1000,
}

/**
 * 將重量／容量換算為克。
 * @param {number} value 數量
 * @param {'g'|'kg'|'oz'|'lb'|'ml'|'l'} unit 單位
 * @returns {number} 對應的克數
 */
export function toGrams(value, unit) {
  const factor = GRAMS_PER_UNIT[unit]
  if (factor === undefined) throw new Error(`未知單位: ${unit}`)
  return value * factor
}

/**
 * 計算每 100 克（或 100 毫升）的台幣單價。
 * @param {{ price: number, rate: number, grams: number }} input
 *   price 外幣價格、rate 正向匯率（1 外幣 = N 台幣）、grams 已換算為克的重量
 * @returns {number} 四捨五入至小數點後 2 位的每 100g 台幣單價
 */
export function pricePer100g({ price, rate, grams }) {
  // 每 100 克價格 = (外幣價格 * 正向匯率 / 重量克數) * 100，四捨五入至 2 位
  const value = (price * rate / grams) * 100
  return Math.round(value * 100) / 100
}

/**
 * 由原始輸入（價格、匯率、重量、單位）直接算出每 100g 台幣單價。
 * @param {{ price: number, rate: number, weight: number, unit: string }} input
 * @returns {number} 四捨五入至小數點後 2 位的每 100g 台幣單價
 */
export function unitPricePer100({ price, rate, weight, unit }) {
  return pricePer100g({ price, rate, grams: toGrams(weight, unit) })
}
