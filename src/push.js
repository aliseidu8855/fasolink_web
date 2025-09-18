// Minimal client helper to request permission and create a push subscription.
// Server-side VAPID and subscription storage are out of scope for now.

export async function initPush() {
  if (import.meta.env.VITE_PUSH_ENABLED !== 'true') return;
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  try {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return;
    const reg = await navigator.serviceWorker.ready;
    // TODO: Replace with your VAPID public key (Base64 URL-safe) if using Web Push with a server
    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    const options = { userVisibleOnly: true };
    if (vapidPublicKey) {
      options.applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
    }
    const sub = await reg.pushManager.subscribe(options);
    // Send subscription to your backend to save (endpoint + keys)
    // await fetch('/api/push/subscribe', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(sub) });
    console.info('[push] subscribed', sub?.endpoint);
  } catch (e) {
    console.warn('[push] init failed', e);
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}
