import { describe, it, expect } from 'vitest'
import { isValidPositiveNumber } from './validate.js'

// 直接把 unit-price-calculator 規格「輸入欄位驗證」的 Scenario 轉成測試
describe('輸入驗證：僅接受有限正數', () => {
  it('正整數 → true', () => expect(isValidPositiveNumber('100')).toBe(true))
  it('正小數 → true', () => expect(isValidPositiveNumber('1.5')).toBe(true))
  it('負數 → false', () => expect(isValidPositiveNumber('-50')).toBe(false))
  it('零 → false', () => expect(isValidPositiveNumber('0')).toBe(false))
  it('空字串 → false', () => expect(isValidPositiveNumber('')).toBe(false))
  it('null → false', () => expect(isValidPositiveNumber(null)).toBe(false))
  it('純文字 → false', () => expect(isValidPositiveNumber('abc')).toBe(false))
  it('含雜符號 → false', () => expect(isValidPositiveNumber('1,,2')).toBe(false))
  it('Infinity（1e999）→ false', () => expect(isValidPositiveNumber('1e999')).toBe(false))
  it('超過安全整數上限（1e308）→ false', () => expect(isValidPositiveNumber('1e308')).toBe(false))
})
