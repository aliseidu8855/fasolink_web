/* Minimal PWA service worker: no offline fallbacks or runtime caching.
   Purpose: enable installability only. */
self.__WB_MANIFEST; // injectManifest placeholder; not used to avoid offline precache
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
// No fetch handler: everything stays online-only.
