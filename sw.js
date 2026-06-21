// Service Worker（task 5.3）：離線快取 + 版本化管理。
// - 快取以版本號命名；activate 時清除所有非當前版本快取。
// - index.html / 導航請求採「網路優先」，部署新版可即時更新；離線才回退快取。
// - 其餘靜態資源採「快取優先」，求離線可用與秒開。
const VERSION = 'v1'
const CACHE = `price-calc-${VERSION}`

// 預先快取的靜態資源（相對路徑，相容 GitHub Pages 子路徑）
const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/main.js',
  './js/calc.js',
  './js/validate.js',
  './js/history.js',
  './js/exchange-rate.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()) // 新版安裝後立即接手
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)) // 清舊版
      ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return // 跨來源（如匯率 API）不攔截

  // 導航 / index.html → 網路優先
  const isNavigation =
    request.mode === 'navigate' ||
    url.pathname.endsWith('/') ||
    url.pathname.endsWith('/index.html')

  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(request, copy))
          return response
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')))
    )
    return
  }

  // 其餘靜態資源 → 快取優先，未命中再抓網路並補快取
  event.respondWith(
    caches.match(request).then((cached) =>
      cached ||
      fetch(request).then((response) => {
        const copy = response.clone()
        caches.open(CACHE).then((cache) => cache.put(request, copy))
        return response
      })
    )
  )
})
