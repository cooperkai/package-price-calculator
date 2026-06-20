// 計算引擎

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
