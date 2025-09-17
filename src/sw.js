/* Minimal PWA service worker (legacy, unused when strategies: 'generateSW').
  Purpose: kept for reference; no offline fallbacks or runtime caching. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
// No fetch handler: everything stays online-only.
