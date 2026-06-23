// 輸入驗證（TDD：此刻為空殼，先讓測試亮紅燈，再實作）

/**
 * 判斷輸入是否為「有限的正數」。
 * 拒絕：負值/零、空白、非數字字元、非有限或超出安全整數上限的值。
 * @param {unknown} raw 來自輸入欄位的原始值（可能為字串）
 * @returns {boolean}
 */
export function isValidPositiveNumber(raw) {
  if (raw === null || raw === undefined) return false
  const str = String(raw).trim()
  if (str === '') return false
  const n = Number(str)
  // 非數字字元、含雜符號 → NaN；1e999 → Infinity，皆非有限值
  if (!Number.isFinite(n)) return false
  if (n <= 0) return false
  // 超出安全整數上限視為溢位、不可信
  if (n > Number.MAX_SAFE_INTEGER) return false
  return true
}

/**
 * 判斷輸入是否為「正整數」。用於件數（單位「個」）——不接受小數（如 2.5 個）。
 * 在有限正數的基礎上額外要求為整數。
 * @param {unknown} raw 來自輸入欄位的原始值（可能為字串）
 * @returns {boolean}
 */
export function isValidPositiveInteger(raw) {
  if (!isValidPositiveNumber(raw)) return false
  return Number.isInteger(Number(String(raw).trim()))
}
