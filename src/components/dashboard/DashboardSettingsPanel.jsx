import React from 'react';
import { useTranslation } from 'react-i18next';

const DashboardSettingsPanel = () => {
  const { t } = useTranslation('dashboard');
  return (
    <div className="dash-panel">
      <header className="dash-panel-header">
        <h2 className="dash-panel-title">{t('settings.title')}</h2>
      </header>
      <p className="muted">{t('settings.coming')}</p>
    </div>
  );
};

export default DashboardSettingsPanel;
