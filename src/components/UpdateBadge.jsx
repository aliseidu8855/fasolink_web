import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function UpdateBadge() {
  const { t } = useTranslation(['common']);
  const [updateSW, setUpdateSW] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onNeedRefresh(e) {
      setUpdateSW(e.detail?.updateSW || null);
      setVisible(true);
    }
    window.addEventListener('pwa:need-refresh', onNeedRefresh);
    return () => window.removeEventListener('pwa:need-refresh', onNeedRefresh);
  }, []);

  if (!visible) return null;

  const onUpdate = () => {
    try {
      updateSW && updateSW();
    } catch {
      // ignore update errors
    }
    setVisible(false);
  };

  const onDismiss = () => setVisible(false);

  return (
    <div role="status" aria-live="polite" style={containerStyle}>
      <span style={{ marginRight: 12 }}>{t('common:update.available')}</span>
      <button onClick={onUpdate} style={primaryBtn}>{t('common:update.updateNow')}</button>
      <button onClick={onDismiss} style={ghostBtn}>{t('common:update.dismiss')}</button>
    </div>
  );
}

const containerStyle = {
  position: 'fixed',
  left: 16,
  right: 16,
  bottom: 16,
  zIndex: 9999,
  background: 'var(--color-bg-surface, #fff)',
  color: 'var(--color-text, #111)',
  border: '1px solid var(--color-border, #ddd)',
  borderRadius: 8,
  padding: '10px 12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
};

const primaryBtn = {
  background: 'var(--color-brand, #DE0000)',
  color: 'var(--color-on-brand, #fff)',
  border: 'none',
  borderRadius: 6,
  padding: '8px 12px',
  cursor: 'pointer',
};

const ghostBtn = {
  background: 'transparent',
  color: 'inherit',
  border: '1px solid var(--color-border, #ddd)',
  borderRadius: 6,
  padding: '8px 12px',
  cursor: 'pointer',
  marginLeft: 8,
};
