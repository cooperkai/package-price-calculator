import { describe, it, expect } from 'vitest'
import { pricePer100g } from './calc.js'

// 直接把 unit-price-calculator 規格的 Scenario 轉成測試（測試先行）
describe('每 100g 單價計算（對應 unit-price-calculator 規格）', () => {
  it('外幣換算：10 USD、500g、匯率 32.5 → 65.00', () => {
    expect(pricePer100g({ price: 10, rate: 32.5, grams: 500 })).toBe(65)
  })

  it('盎司換算：10 TWD、8 oz(226.796g) → 4.41', () => {
    expect(pricePer100g({ price: 10, rate: 1, grams: 226.796 })).toBeCloseTo(4.41, 2)
  })
})
