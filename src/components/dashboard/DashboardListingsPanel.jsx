import React from 'react';
import ListingCard from '../ListingCard.jsx';
import { useTranslation } from 'react-i18next';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Button from '../../components/Button.jsx';

const DashboardListingsPanel = ({ listings, onEdit, onDelete, onNew }) => {
  const { t } = useTranslation('dashboard');
  return (
    <div className="dash-panel">
      <header className="dash-panel-header row">
        <h2 className="dash-panel-title">{t('listings.title')}</h2>
        <div className="dash-panel-actions">
          <button className="btn" onClick={onNew}>{t('listings.new')}</button>
        </div>
      </header>
      {listings.length === 0 && (
        <EmptyState
          title={t('listings.empty')}
          description={t('listings.emptyHelp','You have no listings yet. Create your first listing to get started.')}
          primaryAction={{ label: t('listings.new'), onClick: onNew }}
        />
      )}
      <div className="dash-listings-grid">
        {listings.map(l => (
          <div key={l.id} className="dash-listing-wrapper">
            <ListingCard listing={l} compact />
            <div className="dash-inline-actions">
              <Button size="sm" variant="ghost" onClick={() => onEdit?.(l)}>{t('listings.edit')}</Button>
              <Button size="sm" variant="secondary" onClick={() => onDelete?.(l)}>{t('listings.delete')}</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardListingsPanel;
