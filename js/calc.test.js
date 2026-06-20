import { describe, it, expect } from 'vitest'
import { pricePer100g, toGrams, unitPricePer100 } from './calc.js'

describe('每 100g 單價計算（pricePer100g）', () => {
  it('外幣換算：10 USD、500g、匯率 32.5 → 65.00', () => {
    expect(pricePer100g({ price: 10, rate: 32.5, grams: 500 })).toBe(65)
  })

  it('盎司換算：10 TWD、8 oz(226.796g) → 4.41', () => {
    expect(pricePer100g({ price: 10, rate: 1, grams: 226.796 })).toBeCloseTo(4.41, 2)
  })
})

describe('單位換算為克（toGrams，對應規格換算表）', () => {
  it('g 不變', () => expect(toGrams(1, 'g')).toBe(1))
  it('1 kg = 1000 g', () => expect(toGrams(1, 'kg')).toBe(1000))
  it('1 oz = 28.3495 g', () => expect(toGrams(1, 'oz')).toBeCloseTo(28.3495, 4))
  it('1 lb = 453.592 g', () => expect(toGrams(1, 'lb')).toBeCloseTo(453.592, 3))
  it('1 ml = 1 g（密度 1g/ml）', () => expect(toGrams(1, 'ml')).toBe(1))
  it('1 l = 1000 ml = 1000 g', () => expect(toGrams(1, 'l')).toBe(1000))
  it('1.5 kg = 1500 g', () => expect(toGrams(1.5, 'kg')).toBe(1500))
  it('未知單位應丟出錯誤', () => expect(() => toGrams(1, 'foo')).toThrow())
})

describe('完整單價計算（unitPricePer100，對應規格 Scenario）', () => {
  it('TWD 標準：100 TWD、250 g → 40.00', () => {
    expect(unitPricePer100({ price: 100, rate: 1, weight: 250, unit: 'g' })).toBe(40)
  })
  it('公斤換算：120 TWD、1.5 kg → 8.00', () => {
    expect(unitPricePer100({ price: 120, rate: 1, weight: 1.5, unit: 'kg' })).toBe(8)
  })
  it('盎司換算：10 TWD、8 oz → 4.41', () => {
    expect(unitPricePer100({ price: 10, rate: 1, weight: 8, unit: 'oz' })).toBeCloseTo(4.41, 2)
  })
  it('外幣換算：10 USD、500 g、匯率 32.5 → 65.00', () => {
    expect(unitPricePer100({ price: 10, rate: 32.5, weight: 500, unit: 'g' })).toBe(65)
  })
})
