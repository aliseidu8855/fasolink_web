import React, { useEffect, useState } from 'react'

// Listens for the custom event dispatched in main.jsx when a new SW is waiting.
export default function PWAUpdatePrompt() {
  const [updateSW, setUpdateSW] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onNeedRefresh(e) {
      setUpdateSW(e.detail.updateSW)
      setVisible(true)
    }
    window.addEventListener('pwa:need-refresh', onNeedRefresh)
    return () => window.removeEventListener('pwa:need-refresh', onNeedRefresh)
  }, [])

  if (!visible) return null

  return (
    <div style={styles.container} role="alert" aria-live="polite">
      <span style={styles.text}>Une mise à jour est disponible.</span>
      <div style={styles.actions}>
        <button style={styles.primary} onClick={() => { updateSW && updateSW(); }}>Mettre à jour</button>
        <button style={styles.dismiss} onClick={() => setVisible(false)} aria-label="Fermer">✕</button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    position: 'fixed', bottom: '1rem', left: '50%', transform: 'translateX(-50%)',
    background: 'var(--color-bg-surface)', color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border)', padding: '.75rem .95rem', borderRadius: '12px',
    display: 'flex', gap: '1rem', alignItems: 'center', boxShadow: 'var(--shadow-lg)', zIndex: 4500,
    maxWidth: 420
  },
  text: { fontSize: '.85rem', fontWeight: 500 },
  actions: { display: 'flex', gap: '.5rem', alignItems: 'center' },
  primary: {
    background: 'var(--color-brand)', color: '#fff', border: 'none', cursor: 'pointer',
    padding: '.45rem .8rem', fontSize: '.75rem', fontWeight: 600, borderRadius: 8
  },
  dismiss: {
    background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '.9rem', color: 'var(--color-text-secondary)'
  }
}
