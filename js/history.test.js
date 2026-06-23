import { describe, it, expect } from 'vitest'
import { unitCategory, createItem, groupByCategory, evaluate } from './history.js'

// 依 comparison-history 規格的 Scenario 逐條轉成測試（此刻 history.js 尚未實作 → 紅燈）

describe('單位分組類型：重量類 vs 容量類', () => {
  it('g/kg/oz/lb → weight', () => {
    for (const u of ['g', 'kg', 'oz', 'lb']) expect(unitCategory(u)).toBe('weight')
  })
  it('ml/l → volume', () => {
    for (const u of ['ml', 'l']) expect(unitCategory(u)).toBe('volume')
  })
  it('未知單位 → 丟錯', () => {
    expect(() => unitCategory('xx')).toThrow()
  })
})

describe('建立項目：保存原始輸入與「當時價」快照', () => {
  const input = { name: '白米', price: 10, currency: 'USD', quantity: 1, unit: 'kg', rate: 30, timestamp: 1700000000000 }

  it('原始輸入與時間戳完整保留', () => {
    const item = createItem(input, 1)
    expect(item.name).toBe('白米')
    expect(item.price).toBe(10)
    expect(item.currency).toBe('USD')
    expect(item.quantity).toBe(1)
    expect(item.unit).toBe('kg')
    expect(item.timestamp).toBe(1700000000000)
  })

  it('快照記錄當時匯率與當時單價（10 USD * 30 / 1000g * 100 = 30 TWD/100g）', () => {
    const item = createItem(input, 1)
    expect(item.snapshot.rate).toBe(30)
    expect(item.snapshot.unitPrice).toBe(30)
  })

  it('名稱為空 → 預設「項目 #」', () => {
    expect(createItem({ ...input, name: '' }, 3).name).toBe('項目 3')
  })

  it('項目帶有單位分類', () => {
    expect(createItem(input, 1).category).toBe('weight')
  })
})

describe('依分組整理', () => {
  it('重量類與容量類各自成組', () => {
    const items = [
      createItem({ name: '米', price: 10, currency: 'USD', quantity: 1, unit: 'kg', rate: 30, timestamp: 1 }, 1),
      createItem({ name: '洗髮精', price: 5, currency: 'USD', quantity: 500, unit: 'ml', rate: 30, timestamp: 2 }, 2),
    ]
    const grouped = groupByCategory(items)
    expect(grouped.weight.map((i) => i.name)).toEqual(['米'])
    expect(grouped.volume.map((i) => i.name)).toEqual(['洗髮精'])
  })
})

describe('以當前匯率即時重算並各組高亮最划算', () => {
  const rates = { USD: 30, JPY: 0.2 }

  it('重量組內找最低單價標記 isBestDeal，不跨組', () => {
    const items = [
      // A：10 USD / 1kg → 30 TWD/100g
      createItem({ name: 'A米', price: 10, currency: 'USD', quantity: 1, unit: 'kg', rate: 30, timestamp: 1 }, 1),
      // B：5 USD / 1kg → 15 TWD/100g（重量組最划算）
      createItem({ name: 'B米', price: 5, currency: 'USD', quantity: 1, unit: 'kg', rate: 30, timestamp: 2 }, 2),
      // C：容量類，獨立一組，應自成最划算
      createItem({ name: 'C精', price: 5, currency: 'USD', quantity: 500, unit: 'ml', rate: 30, timestamp: 3 }, 3),
    ]
    const evaluated = evaluate(items, rates)
    const best = evaluated.filter((i) => i.isBestDeal).map((i) => i.name)
    expect(best).toEqual(expect.arrayContaining(['B米', 'C精']))
    expect(best).not.toContain('A米')
    // 各組恰有一個最划算
    expect(best).toHaveLength(2)
  })

  it('以當前匯率重算（非用當時快照）', () => {
    // 當時匯率 30，但現在 USD 漲到 60 → 當前單價應為快照的兩倍
    const item = createItem({ name: '米', price: 10, currency: 'USD', quantity: 1, unit: 'kg', rate: 30, timestamp: 1 }, 1)
    const [evaluated] = evaluate([item], { USD: 60 })
    expect(evaluated.snapshot.unitPrice).toBe(30) // 快照不變
    expect(evaluated.currentUnitPrice).toBe(60) // 以當前匯率重算
  })

  it('匯率變動後重新排名', () => {
    const items = [
      createItem({ name: '美A', price: 10, currency: 'USD', quantity: 1, unit: 'kg', rate: 30, timestamp: 1 }, 1),
      createItem({ name: '日B', price: 1500, currency: 'JPY', quantity: 1, unit: 'kg', rate: 0.2, timestamp: 2 }, 2),
    ]
    // 初始：美A=10*30/1000*100=30；日B=1500*0.2/1000*100=30 → 平手，取第一個美A
    const best1 = evaluate(items, { USD: 30, JPY: 0.2 }).find((i) => i.isBestDeal).name
    expect(best1).toBe('美A')
    // USD 漲到 45：美A=45；日B 不變=30 → 日B 最划算
    const best2 = evaluate(items, { USD: 45, JPY: 0.2 }).find((i) => i.isBestDeal).name
    expect(best2).toBe('日B')
  })
})
