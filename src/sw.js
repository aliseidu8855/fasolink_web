/* Minimal PWA service worker: no offline fallbacks or runtime caching.
   Purpose: enable installability only. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
// No fetch handler: everything stays online-only.
