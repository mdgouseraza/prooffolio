const CACHE_VERSION = 'proofolio-v1'
const CACHE_NAME = `proofolio-static-${CACHE_VERSION}`

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  if (request.url.includes('/api/')) return
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request)),
  )
})
