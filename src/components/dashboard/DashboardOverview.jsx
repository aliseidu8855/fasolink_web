import React from 'react';
import DashboardStatCard from './DashboardStatCard';
import { useTranslation } from 'react-i18next';

const DashboardOverview = ({ stats, user }) => {
  const { t } = useTranslation('dashboard');
  return (
    <div className="dash-panel">
      <header className="dash-panel-header">
        <h1 className="dash-page-title">{t('overview.title', { username: user?.username || '' })}</h1>
        <p className="dash-page-subtitle">{t('overview.subtitle')}</p>
      </header>
      <div className="dash-stats-grid">
        <DashboardStatCard label={t('overview.stats.active')} value={stats.active} tone="mint" />
        <DashboardStatCard label={t('overview.stats.total')} value={stats.total} />
        <DashboardStatCard label={t('overview.stats.views')} value={stats.views} tone="gold" />
        <DashboardStatCard label={t('overview.stats.messages')} value={stats.messages} tone="clay" />
      </div>
    </div>
  );
};

export default DashboardOverview;
