// 匯率服務（TDD：此刻為空殼，先讓測試亮紅燈，再實作）
// 對應 openspec exchange-rate-service 規格；task 2.2 / 2.3 實作至綠燈。

/**
 * 將「1 TWD = X 外幣」的 API 匯率取倒數，正規化為「1 外幣 = N 台幣」正向匯率。
 * @param {number} apiRate API 回傳的 TWD 基準匯率
 * @returns {number} 正向匯率
 */
export function normalizeRate(apiRate) {
  // TODO: 尚未實作（紅燈）
}

/**
 * 判斷本地快取是否仍在效期內（未滿 24 小時則不重新請求）。
 * @param {number} lastUpdated 快取時間戳記（ms）
 * @param {number} now 現在時間戳記（ms）
 * @param {number} [maxAgeMs] 效期，預設 24 小時
 * @returns {boolean}
 */
export function isCacheFresh(lastUpdated, now, maxAgeMs = 24 * 60 * 60 * 1000) {
  // TODO: 尚未實作（紅燈）
}

/**
 * 驗證手動輸入的匯率是否為大於零的有限正數（重用輸入驗證規則）。
 * @param {unknown} raw
 * @returns {boolean}
 */
export function isValidManualRate(raw) {
  // TODO: 尚未實作（紅燈）
}

/**
 * 合併自動更新結果，保留已鎖定貨幣的手動匯率、僅更新未鎖定者。
 * @param {Record<string, {rate:number, locked?:boolean}>} current 目前匯率表
 * @param {Record<string, {rate:number}>} fetched 新取得的匯率表
 * @returns {Record<string, {rate:number, locked?:boolean}>}
 */
export function mergeWithLocks(current, fetched) {
  // TODO: 尚未實作（紅燈）
}

/**
 * 多來源降級鏈：依序嘗試各線上來源，全部失敗則退回快取，無快取再退回預設值。
 * @param {{ sources: Array<() => Promise<object>>, cache: {rates:object}|null, defaults: object }} deps
 * @returns {Promise<{ rates: object, source: 'primary'|'fallback'|'cache'|'default' }>}
 */
export async function fetchWithFallback({ sources, cache, defaults }) {
  // TODO: 尚未實作（紅燈）
}
