import { useCallback, useEffect, useState } from 'react'

/**
 * usePWAInstallPrompt
 * Captures the deferred beforeinstallprompt event so we can trigger install UI manually.
 * Returns { canInstall, promptInstall, installed }.
 */
export default function usePWAInstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      // Prevent automatic mini-infobar (on some browsers)
      e.preventDefault()
      setDeferredEvent(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => {
      setInstalled(true)
      setDeferredEvent(null)
    })
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', () => {})
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferredEvent) return false
    deferredEvent.prompt()
    const choice = await deferredEvent.userChoice.catch(() => null)
    setDeferredEvent(null) // Only usable once
    return choice?.outcome === 'accepted'
  }, [deferredEvent])

  return { canInstall: !!deferredEvent && !installed, promptInstall, installed }
}
