import React, { useEffect, useState } from 'react'
import usePWAInstallPrompt from '../../hooks/usePWAInstallPrompt'
import '../../styles/global.css'

// Simple floating install button. Could be refined into a toast/banner.
export default function InstallPWA() {
  const { canInstall, promptInstall, installed } = usePWAInstallPrompt()
  const [dismissed, setDismissed] = useState(false)

  // Restore dismissal state
  useEffect(() => {
    if (localStorage.getItem('pwa_install_dismissed') === '1') {
      setDismissed(true)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem('pwa_install_dismissed', '1')
    setDismissed(true)
  }

  const devForce = import.meta.env.VITE_FORCE_INSTALL_BTN === 'true'
  if (!devForce && (!canInstall || dismissed || installed)) return null

  return (
    <div style={styles.container} role="dialog" aria-label="Installer l'application">
      <div style={styles.content}>
        <div style={styles.text}>Installer l'application FasoLink ?</div>
        <div style={styles.actions}>
          <button style={styles.installBtn} onClick={promptInstall}>Installer</button>
          <button style={styles.dismissBtn} onClick={dismiss} aria-label="Fermer">✕</button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    position: 'fixed', bottom: '1.25rem', right: '1.25rem', zIndex: 4000,
    maxWidth: 280, fontFamily: 'var(--font-sans)'
  },
  content: {
    background: '#FFFFFF', border: '1px solid var(--color-border)', padding: '0.85rem 0.9rem 0.9rem',
    borderRadius: '12px', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: '.6rem'
  },
  text: { fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.3, color: 'var(--color-text-primary)' },
  actions: { display: 'flex', gap: '.5rem', alignItems: 'center', justifyContent: 'space-between' },
  installBtn: {
    background: 'var(--color-brand)', color: '#fff', border: 'none', cursor: 'pointer', padding: '.5rem .9rem', fontSize: '.75rem',
    borderRadius: '8px', fontWeight: 600
  },
  dismissBtn: {
    background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '.9rem', color: 'var(--color-text-secondary)'
  }
}
