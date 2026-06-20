// 匯率服務
// 對應 openspec exchange-rate-service 規格：正規化、降級鏈、節流、手動鎖定。

import { isValidPositiveNumber } from './validate.js'

// 線上來源依索引對應的標示（主來源 → 備援來源）
const SOURCE_LABELS = ['primary', 'fallback']

/**
 * 將「1 TWD = X 外幣」的 API 匯率取倒數，正規化為「1 外幣 = N 台幣」正向匯率。
 * @param {number} apiRate API 回傳的 TWD 基準匯率
 * @returns {number} 正向匯率
 */
export function normalizeRate(apiRate) {
  return 1 / apiRate
}

/**
 * 判斷本地快取是否仍在效期內（未滿 24 小時則不重新請求）。
 * @param {number} lastUpdated 快取時間戳記（ms）
 * @param {number} now 現在時間戳記（ms）
 * @param {number} [maxAgeMs] 效期，預設 24 小時
 * @returns {boolean}
 */
export function isCacheFresh(lastUpdated, now, maxAgeMs = 24 * 60 * 60 * 1000) {
  return now - lastUpdated < maxAgeMs
}

/**
 * 驗證手動輸入的匯率是否為大於零的有限正數（重用輸入驗證規則）。
 * @param {unknown} raw
 * @returns {boolean}
 */
export function isValidManualRate(raw) {
  return isValidPositiveNumber(raw)
}

/**
 * 合併自動更新結果，保留已鎖定貨幣的手動匯率、僅更新未鎖定者。
 * @param {Record<string, {rate:number, locked?:boolean}>} current 目前匯率表
 * @param {Record<string, {rate:number}>} fetched 新取得的匯率表
 * @returns {Record<string, {rate:number, locked?:boolean}>}
 */
export function mergeWithLocks(current, fetched) {
  const merged = {}
  for (const [code, entry] of Object.entries(current)) {
    if (entry.locked) {
      merged[code] = entry // 已鎖定 → 原封保留手動值
    } else {
      merged[code] = { ...entry, rate: fetched[code]?.rate ?? entry.rate }
    }
  }
  return merged
}

/**
 * 多來源降級鏈：依序嘗試各線上來源，全部失敗則退回快取，無快取再退回預設值。
 * @param {{ sources: Array<() => Promise<object>>, cache: {rates:object}|null, defaults: object }} deps
 * @returns {Promise<{ rates: object, source: 'primary'|'fallback'|'cache'|'default' }>}
 */
export async function fetchWithFallback({ sources, cache, defaults }) {
  for (let i = 0; i < sources.length; i++) {
    try {
      const rates = await sources[i]()
      return { rates, source: SOURCE_LABELS[i] ?? `source-${i}` }
    } catch {
      // 此來源失敗，往下一層降級
    }
  }
  if (cache) return { rates: cache.rates, source: 'cache' }
  return { rates: defaults, source: 'default' }
}
