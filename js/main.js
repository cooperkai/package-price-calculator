// 介面接線：把已測過的純邏輯（validate / calc / history）接到 DOM。
// 註：真實匯率 fetch、localStorage 持久化與離線屬整合層，交 Playwright E2E（task 6.x）。

import { isValidPositiveNumber } from './validate.js'
import { unitPricePer100 } from './calc.js'
import { createItem, evaluate, groupByCategory } from './history.js'

const $ = (id) => document.getElementById(id)

// 記憶體狀態
const items = []
const rates = {} // 幣別 → 當前匯率（1 外幣 = N 台幣）
let seq = 1

const els = {
  form: $('calc-form'),
  name: $('item-name'),
  price: $('price'),
  currency: $('currency'),
  amount: $('amount'),
  unit: $('unit'),
  rate: $('rate'),
  result: $('result'),
  add: $('add-btn'),
  clear: $('clear-btn'),
  history: $('history'),
}

/** 讀取並驗證表單，回傳乾淨的數值輸入；不合法則回傳 null 並顯示錯誤。 */
function readForm() {
  const price = els.price.value
  const amount = els.amount.value
  const rate = els.rate.value
  if (!isValidPositiveNumber(price) || !isValidPositiveNumber(amount) || !isValidPositiveNumber(rate)) {
    showError('價格、重量／容量與匯率皆須為大於零的有限數字。')
    return null
  }
  return {
    name: els.name.value,
    price: Number(price),
    currency: els.currency.value,
    weight: Number(amount),
    unit: els.unit.value,
    rate: Number(rate),
    timestamp: Date.now(),
  }
}

function showError(msg) {
  els.result.classList.add('error')
  els.result.textContent = `⚠️ ${msg}`
}

function showResult(input) {
  const per100 = unitPricePer100(input)
  const per = input.unit === 'ml' || input.unit === 'l' ? '100ML' : '100G'
  els.result.classList.remove('error')
  els.result.innerHTML = `每 ${per}：<strong>NT$ ${per100}</strong>`
}

/** 計算單價（task 3.x 邏輯）並更新該幣別當前匯率。 */
function onCalc(e) {
  e.preventDefault()
  const input = readForm()
  if (!input) return
  rates[input.currency] = input.rate
  showResult(input)
}

/** 加入比價列表（task 4.4）。 */
function onAdd() {
  const input = readForm()
  if (!input) return
  rates[input.currency] = input.rate
  showResult(input)
  items.push(createItem(input, seq++))
  render()
}

function onDelete(index) {
  items.splice(index, 1)
  render()
}

function onClear() {
  items.length = 0
  render()
}

/** 以當前匯率即時重算、分組並高亮最划算（task 4.3/4.4）。 */
function render() {
  if (items.length === 0) {
    els.history.innerHTML = '<p class="empty">尚無項目，計算後點「加入比價列表」。</p>'
    return
  }

  const evaluated = evaluate(items, rates)
  // 保留原始索引以供刪除
  evaluated.forEach((it, i) => { it._index = i })
  const grouped = groupByCategory(evaluated)

  const sections = [
    { title: '重量類（每 100G）', rows: grouped.weight, per: '100G' },
    { title: '容量類（每 100ML）', rows: grouped.volume, per: '100ML' },
  ]

  els.history.innerHTML = sections
    .filter((s) => s.rows.length > 0)
    .map((s) => `
      <p class="group-title">${s.title}</p>
      <table>
        <thead><tr><th>商品</th><th>現價 NT$/${s.per}</th><th>當時價</th><th></th></tr></thead>
        <tbody>
          ${s.rows.map(rowHtml).join('')}
        </tbody>
      </table>
    `).join('')

  // 綁定刪除
  els.history.querySelectorAll('.del[data-index]').forEach((btn) => {
    btn.addEventListener('click', () => onDelete(Number(btn.dataset.index)))
  })
}

function rowHtml(it) {
  const best = it.isBestDeal ? ' class="best"' : ''
  const tag = it.isBestDeal ? ' <span class="tag">最划算</span>' : ''
  return `<tr${best}>
    <td>${escapeHtml(it.name)}${tag}</td>
    <td>NT$ ${it.currentPricePer100}</td>
    <td class="snapshot">NT$ ${it.snapshot.pricePer100}<br>（匯率 ${it.snapshot.rate}）</td>
    <td><button class="del" data-index="${it._index}">刪除</button></td>
  </tr>`
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ))
}

els.form.addEventListener('submit', onCalc)
els.add.addEventListener('click', onAdd)
els.clear.addEventListener('click', onClear)
render()
