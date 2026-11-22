const SHELL_VERSION = "38a34f2fde2c3ecc"
const SHELL_FILES = ["index-C5iotMl6.css","index-Cw023naV.js","index.html","ledger-180.png","ledger-192.png","ledger-512.png","ledger.webmanifest"]
const cachePrefix = 'ledger-shell:' + self.registration.scope + ':'
const cacheName = cachePrefix + SHELL_VERSION
const startUrl = new URL('./', self.registration.scope)
const indexUrl = new URL('index.html', startUrl)

self.addEventListener('install', (event) => {
  const requests = SHELL_FILES.map((file) => new Request(new URL(file, startUrl), { cache: 'reload' }))
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(requests)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter((key) => key.startsWith(cachePrefix) && key !== cacheName)
      .map((key) => caches.delete(key)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (!url.href.startsWith(startUrl.href)) return

  const isAppNavigation = request.mode === 'navigate' &&
    (url.pathname === startUrl.pathname || url.pathname === indexUrl.pathname)

  event.respondWith((async () => {
    const cache = await caches.open(cacheName)
    const cached = await cache.match(isAppNavigation ? indexUrl : request)
    return cached ?? fetch(request)
  })())
})
