/* eslint-env serviceworker */
self.addEventListener('push', (event) => {
  try {
    const data = event.data ? event.data.json() : {}
    const title = data.title || 'FasoLink'
    const body = data.body || ''
    const url = data.url || '/messages'
    const options = {
      body,
      icon: '/icons/manifest-icon-192.maskable.png',
      badge: '/icons/favicon-196.png',
      data: { url },
    }
    event.waitUntil(self.registration.showNotification(title, options))
  } catch {
    // ignore
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = (event.notification.data && event.notification.data.url) || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.postMessage({ type: 'nav', url: target })
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(target)
      }
    })
  )
})
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
