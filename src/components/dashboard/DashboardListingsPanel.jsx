import React from 'react';
import ListingCard from '../ListingCard.jsx';
import { useTranslation } from 'react-i18next';

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
        <p className="muted">{t('listings.empty')}</p>
      )}
      <div className="dash-listings-grid">
        {listings.map(l => (
          <div key={l.id} className="dash-listing-wrapper">
            <ListingCard listing={l} compact />
            <div className="dash-inline-actions">
              <button onClick={() => onEdit?.(l)} className="text-btn">{t('listings.edit')}</button>
              <button onClick={() => onDelete?.(l)} className="text-btn danger">{t('listings.delete')}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardListingsPanel;
