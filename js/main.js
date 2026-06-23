// 介面接線：把已測過的純邏輯（validate / calc / history）接到 DOM。
// 註：真實匯率 fetch、localStorage 持久化與離線屬整合層，交 Playwright E2E（task 6.x）。

import { isValidPositiveNumber, isValidPositiveInteger } from './validate.js'
import { unitPrice } from './calc.js'
import { createItem, evaluate, groupByCategory, unitCategory } from './history.js'
import { describeRateStatus } from './exchange-rate.js'

const $ = (id) => document.getElementById(id)

// 內建預設匯率（1 外幣 = N 台幣）。真實線上 fetch 與 localStorage 持久化屬整合層，交 task 6.x E2E；
// 此處先以預設值種入，狀態顯示為「預設估計值，請手動校正」。
const DEFAULT_RATES = { USD: 31.25, TWD: 1, JPY: 0.21, EUR: 33.8, KRW: 0.023, CNY: 4.3, GBP: 39.5 }

// 各分組的比較基準顯示標籤（重量每 100g、容量每 100mL、件數每件）
const PER_LABEL = { weight: '100g', volume: '100mL', count: '件' }

// 記憶體狀態
const items = []
// 每幣別匯率狀態：{ rate, locked, source, lastUpdated }
const rateState = {}
for (const [code, rate] of Object.entries(DEFAULT_RATES)) {
  rateState[code] = { rate, locked: false, source: 'default', lastUpdated: null }
}
let seq = 1

const els = {
  form: $('calc-form'),
  name: $('item-name'),
  price: $('price'),
  currency: $('currency'),
  amount: $('amount'),
  amountLabel: $('amount-label'),
  unit: $('unit'),
  rate: $('rate'),
  rateField: $('rate-field'),
  rateStatus: $('rate-status'),
  result: $('result'),
  add: $('add-btn'),
  clear: $('clear-btn'),
  history: $('history'),
}

/** 由匯率狀態表導出 evaluate 需要的「幣別 → 匯率」純對應。 */
function currentRates() {
  return Object.fromEntries(Object.entries(rateState).map(([c, s]) => [c, s.rate]))
}

/** 手動覆寫某幣別匯率 → 立即套用並標記為「已鎖定」（自動更新流程將跳過，見 mergeWithLocks）。 */
function applyManualRate(currency, rate) {
  rateState[currency] = { rate, locked: true, source: 'manual', lastUpdated: Date.now() }
}

/** 解除鎖定 → 還原為內建預設匯率，下次自動更新即可恢復覆寫。 */
function onUnlock(currency) {
  rateState[currency] = { rate: DEFAULT_RATES[currency], locked: false, source: 'default', lastUpdated: null }
  els.rate.value = DEFAULT_RATES[currency]
  renderRateStatus()
  render() // 匯率變動 → 比價列表即時重算重排
}

/** 依當前選取幣別呈現匯率狀態：鎖定顯示鎖頭＋解除鈕，否則套用 describeRateStatus。 */
function renderRateStatus() {
  const cur = els.currency.value
  const st = rateState[cur]
  if (st.locked) {
    els.rateStatus.className = 'rate-status locked'
    els.rateStatus.innerHTML =
      `🔒 ${escapeHtml(cur)} 已鎖定（手動 ${st.rate}）` +
      ` <button type="button" class="link-btn" id="unlock-btn">解除鎖定</button>`
    $('unlock-btn').addEventListener('click', () => onUnlock(cur))
    return
  }
  const s = describeRateStatus({ source: st.source, lastUpdated: st.lastUpdated, now: Date.now() })
  const time = s.showTime && st.lastUpdated ? `（${new Date(st.lastUpdated).toLocaleString()}）` : ''
  els.rateStatus.className = `rate-status ${s.level}`
  els.rateStatus.textContent = `${cur}：${s.message}${time}`
}

/** 切換幣別時，以該幣別現有匯率回填輸入框並刷新狀態。 */
function onCurrencyChange() {
  const cur = els.currency.value
  // 純台幣：匯率固定為 1、隱藏匯率欄位與狀態、不需換算
  if (cur === 'TWD') {
    els.rate.value = 1
    els.rateField.style.display = 'none'
    return
  }
  els.rateField.style.display = ''
  els.rate.value = rateState[cur].rate
  renderRateStatus()
}

/** 切換單位時，件數類把「重量／容量」標籤改為「數量（件）」並調整提示。 */
function onUnitChange() {
  const isCount = unitCategory(els.unit.value) === 'count'
  els.amountLabel.textContent = isCount ? '數量（件）' : '重量／容量'
  els.amount.placeholder = isCount ? '10' : '500'
}

/** 讀取並驗證表單，回傳乾淨的數值輸入；不合法則回傳 null 並顯示錯誤。 */
function readForm() {
  const price = els.price.value
  const amount = els.amount.value
  const rate = els.rate.value
  const unit = els.unit.value
  // 件數類（個）數量須為正整數；重量／容量類接受有限正數
  const isCount = unitCategory(unit) === 'count'
  const amountOk = isCount ? isValidPositiveInteger(amount) : isValidPositiveNumber(amount)
  if (!isValidPositiveNumber(price) || !amountOk || !isValidPositiveNumber(rate)) {
    showError(isCount
      ? '價格與匯率須為大於零的數字，件數須為正整數。'
      : '價格、重量／容量與匯率皆須為大於零的有限數字。')
    return null
  }
  return {
    name: els.name.value,
    price: Number(price),
    currency: els.currency.value,
    quantity: Number(amount),
    unit,
    rate: Number(rate),
    timestamp: Date.now(),
  }
}

function showError(msg) {
  els.result.classList.add('error')
  els.result.textContent = `⚠️ ${msg}`
}

function showResult(input) {
  const per = PER_LABEL[unitCategory(input.unit)]
  els.result.classList.remove('error')
  els.result.innerHTML = `每 ${per}：<strong>NT$ ${unitPrice(input)}</strong>`
}

/** 計算單價（task 3.x 邏輯）並以手動匯率覆寫＋鎖定該幣別（task 2.4）。 */
function onCalc(e) {
  e.preventDefault()
  const input = readForm()
  if (!input) return
  // 純台幣免匯率：不套用手動匯率、不顯示匯率狀態
  if (input.currency !== 'TWD') {
    applyManualRate(input.currency, input.rate)
    renderRateStatus()
  }
  showResult(input)
}

/** 加入比價列表（task 4.4）。 */
function onAdd() {
  const input = readForm()
  if (!input) return
  if (input.currency !== 'TWD') {
    applyManualRate(input.currency, input.rate)
    renderRateStatus()
  }
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

  const evaluated = evaluate(items, currentRates())
  // 保留原始索引以供刪除
  evaluated.forEach((it, i) => { it._index = i })
  const grouped = groupByCategory(evaluated)

  const sections = [
    { title: '重量類（每 100g）', rows: grouped.weight, per: '100g' },
    { title: '容量類（每 100mL）', rows: grouped.volume, per: '100mL' },
    { title: '件數類（每件）', rows: grouped.count, per: '件' },
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
    <td>NT$ ${it.currentUnitPrice}</td>
    <td class="snapshot">NT$ ${it.snapshot.unitPrice}<br>（匯率 ${it.snapshot.rate}）</td>
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
els.currency.addEventListener('change', onCurrencyChange)
els.unit.addEventListener('change', onUnitChange)
onCurrencyChange() // 初始：回填預設匯率並顯示狀態
onUnitChange() // 初始：依當前單位設定數量標籤
render()
