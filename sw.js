const SHELL_VERSION = "879fc95bf8ed2cd1"
const SHELL_FILES = ["index-BTKN06sC.js","index-mPSBe1aG.css","ledger-kuaile-CZ0MWGRR.woff2","index.html","ledger-comet-180.png","ledger-comet-192.png","ledger-comet-512.png","ledger.webmanifest","zcool-kuaile-license.txt"]
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
