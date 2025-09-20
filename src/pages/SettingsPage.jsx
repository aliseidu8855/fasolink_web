import React, { useState } from 'react'
import Button from '../components/Button'
import { initPush } from '../push'

export default function SettingsPage() {
  const [status, setStatus] = useState('')

  const recheckInstall = () => {
    localStorage.removeItem('pwa_install_dismissed')
    // Fire synthetic event to encourage hook to show again if event recurs later.
    setStatus('Réinitialisé. Revisitez la page d’accueil; l’option apparaîtra quand le navigateur émettra à nouveau l’événement.')
  }

  const resetIOSBanner = () => {
    localStorage.removeItem('ios_a2hs_dismissed')
    setStatus('Bannière iOS réinitialisée. Recharger sur iOS Safari pour la revoir.')
  }

  return (
    <div className="container" style={{ maxWidth: 640, margin: '0 auto', padding: '1.5rem var(--container-pad-x)' }}>
      <h1 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Paramètres</h1>
      <section style={sectionStyle}>
        <h2 style={h2Style}>PWA / Installation</h2>
        <p style={pStyle}>Utiliser les actions ci‑dessous pour réafficher les invites d’installation.</p>
        <div style={btnRow}>
          <Button variant="primary" onClick={recheckInstall}>Réinitialiser l’invite d’installation</Button>
          <Button variant="secondary" onClick={resetIOSBanner}>Réinitialiser bannière iOS A2HS</Button>
        </div>
        {status && <p style={{ ...pStyle, color: 'var(--color-text-secondary)', marginTop: '.75rem' }}>{status}</p>}
      </section>
      <section style={{ ...sectionStyle, marginTop: '1rem' }}>
        <h2 style={h2Style}>Notifications push</h2>
        <p style={pStyle}>Activer les notifications pour recevoir des alertes de messages et de mises à jour.</p>
        <div style={btnRow}>
          <Button onClick={async ()=>{ await initPush(); setStatus('Demande d’activation envoyée (si activée côté serveur).'); }}>Activer les notifications</Button>
        </div>
      </section>
    </div>
  )
}

const sectionStyle = { border: '1px solid var(--color-border)', borderRadius: 12, padding: '1rem 1.1rem', background: 'var(--color-bg-surface)' }
const h2Style = { fontSize: '1rem', margin: 0, marginBottom: '.5rem' }
const pStyle = { fontSize: '.8rem', lineHeight: 1.35, margin: 0 }
const btnRow = { display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginTop: '.75rem' }
