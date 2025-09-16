import React, { useEffect, useState } from 'react'

function isIOS() {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isInStandalone() {
  return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true
}

export default function IOSAddToHomeBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!isIOS()) return
    if (isInStandalone()) return
    if (localStorage.getItem('ios_a2hs_dismissed') === '1') return
    // Delay a bit so it doesn't collide with other UI
    const t = setTimeout(() => setShow(true), 1500)
    return () => clearTimeout(t)
  }, [])

  if (!show) return null

  const dismiss = () => { localStorage.setItem('ios_a2hs_dismissed', '1'); setShow(false) }

  return (
    <div style={styles.container} role="note" aria-label="Ajouter à l'écran d'accueil">
      <div style={styles.body}>
        <div style={styles.text}>Pour installer FasoLink sur votre iPhone : touchez <strong>Partager</strong> puis <strong>Ajouter à l'écran d'accueil</strong>.</div>
        <button onClick={dismiss} style={styles.close} aria-label="Fermer">✕</button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    position: 'fixed', bottom: '0.75rem', left: '0.75rem', right: '0.75rem', zIndex: 4400,
    fontFamily: 'var(--font-sans)'
  },
  body: {
    background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 16,
    padding: '.85rem .95rem', fontSize: '.8rem', lineHeight: 1.35, color: 'var(--color-text-primary)',
    boxShadow: 'var(--shadow-lg)', position: 'relative'
  },
  text: { },
  close: {
    position: 'absolute', top: 6, right: 8, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '.9rem',
    color: 'var(--color-text-secondary)'
  }
}
