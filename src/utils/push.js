// Minimal Web Push subscription helper
import apiClient from '../services/api'

const base64ToUint8Array = (base64) => {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(b64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

export async function ensurePushSubscription({ vapidPublicKey }) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return { enabled: false, reason: 'unsupported' }
  if (Notification.permission === 'denied') return { enabled: false, reason: 'denied' }
  const reg = await navigator.serviceWorker.ready
  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64ToUint8Array(vapidPublicKey) })
  }
  const json = sub.toJSON()
  await apiClient.post('push-subscriptions/', {
    endpoint: json.endpoint,
    p256dh: json.keys?.p256dh,
    auth: json.keys?.auth,
    user_agent: navigator.userAgent,
  })
  return { enabled: true }
}

export async function disablePushSubscription() {
  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.getSubscription()
  if (sub) {
    const json = sub.toJSON()
    try {
      await apiClient.delete('push-subscriptions/', { data: { endpoint: json.endpoint } })
    } catch (e) {
      // ignore network errors when cleaning up subscription
      console.warn('[push] unsubscribe cleanup failed', e)
    }
    await sub.unsubscribe()
  }
}
