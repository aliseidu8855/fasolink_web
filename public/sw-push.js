/* Basic push notification handler (custom). */
self.addEventListener('push', event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    // ignore parse errors
  }
  const title = data.title || 'FasoLink';
  const options = {
    body: data.body || 'You have a new notification.',
    icon: '/icons/manifest-icon-192.maskable.png',
    badge: '/icons/favicon-196.png',
    data: data.url ? { url: data.url } : undefined,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || '/';
  event.waitUntil(self.clients.openWindow(targetUrl));
});
