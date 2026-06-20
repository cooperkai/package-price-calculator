import { describe, it, expect, vi } from 'vitest'
import {
  normalizeRate,
  isCacheFresh,
  isValidManualRate,
  mergeWithLocks,
  fetchWithFallback,
} from './exchange-rate.js'

// 依 exchange-rate-service 規格的 Scenario 逐條轉成測試（此刻 exchange-rate.js 尚未實作 → 紅燈）

describe('匯率正規化：TWD 基準取倒數轉正向', () => {
  // API（open.er-api.com/.../TWD）回傳「1 TWD = X 外幣」，需取倒數成「1 外幣 = N 台幣」
  it('1 TWD = 0.032 USD → 1 USD = 31.25 TWD', () => {
    expect(normalizeRate(0.032)).toBeCloseTo(31.25, 5)
  })
  it('取倒數兩次回到原值', () => {
    expect(normalizeRate(normalizeRate(31.25))).toBeCloseTo(31.25, 5)
  })
})

describe('請求節流：快取未滿 24 小時不重新請求', () => {
  const DAY = 24 * 60 * 60 * 1000
  it('距今 1 小時 → 仍新鮮', () => {
    const now = 1_000_000_000_000
    expect(isCacheFresh(now - 60 * 60 * 1000, now)).toBe(true)
  })
  it('距今剛好 24 小時 → 已過期', () => {
    const now = 1_000_000_000_000
    expect(isCacheFresh(now - DAY, now)).toBe(false)
  })
  it('距今 25 小時 → 已過期', () => {
    const now = 1_000_000_000_000
    expect(isCacheFresh(now - 25 * 60 * 60 * 1000, now)).toBe(false)
  })
})

describe('無效手動匯率拒絕：僅接受大於零的有限正數', () => {
  it('正數 → true', () => expect(isValidManualRate('33.1')).toBe(true))
  it('負數 → false', () => expect(isValidManualRate('-1')).toBe(false))
  it('零 → false', () => expect(isValidManualRate('0')).toBe(false))
  it('空白 → false', () => expect(isValidManualRate('')).toBe(false))
  it('非數字 → false', () => expect(isValidManualRate('abc')).toBe(false))
})

describe('手動鎖定：自動更新跳過已鎖定貨幣', () => {
  it('鎖定的貨幣保留手動值，未鎖定的以新值覆寫', () => {
    const current = {
      USD: { rate: 33.1, locked: true },
      JPY: { rate: 0.21, locked: false },
    }
    const fetched = { USD: { rate: 31.5 }, JPY: { rate: 0.22 } }
    const merged = mergeWithLocks(current, fetched)
    expect(merged.USD.rate).toBe(33.1) // 鎖定 → 不被覆蓋
    expect(merged.USD.locked).toBe(true)
    expect(merged.JPY.rate).toBe(0.22) // 未鎖定 → 更新
  })
})

describe('多來源降級鏈：任一層失敗即往下一層', () => {
  const cache = { rates: { USD: 30 }, source: 'cache' }
  const defaults = { USD: 32 }

  it('主來源成功 → 用主來源', async () => {
    const primary = vi.fn().mockResolvedValue({ USD: 31.25 })
    const fallback = vi.fn().mockResolvedValue({ USD: 99 })
    const result = await fetchWithFallback({ sources: [primary, fallback], cache, defaults })
    expect(result.source).toBe('primary')
    expect(result.rates.USD).toBe(31.25)
    expect(fallback).not.toHaveBeenCalled()
  })

  it('主來源失敗 → 改用備援來源', async () => {
    const primary = vi.fn().mockRejectedValue(new Error('timeout'))
    const fallback = vi.fn().mockResolvedValue({ USD: 31.5 })
    const result = await fetchWithFallback({ sources: [primary, fallback], cache, defaults })
    expect(result.source).toBe('fallback')
    expect(result.rates.USD).toBe(31.5)
  })

  it('所有線上來源皆失敗 → 用本地快取', async () => {
    const primary = vi.fn().mockRejectedValue(new Error('x'))
    const fallback = vi.fn().mockRejectedValue(new Error('y'))
    const result = await fetchWithFallback({ sources: [primary, fallback], cache, defaults })
    expect(result.source).toBe('cache')
    expect(result.rates.USD).toBe(30)
  })

  it('全部失敗且無快取 → 退回內建預設值', async () => {
    const primary = vi.fn().mockRejectedValue(new Error('x'))
    const fallback = vi.fn().mockRejectedValue(new Error('y'))
    const result = await fetchWithFallback({ sources: [primary, fallback], cache: null, defaults })
    expect(result.source).toBe('default')
    expect(result.rates.USD).toBe(32)
  })
})
