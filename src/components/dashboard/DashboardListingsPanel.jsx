import React, { useState } from 'react';
import ListingCard from '../ListingCard.jsx';
import { useTranslation } from 'react-i18next';
import EmptyState from '../ui/EmptyState.jsx';
import Button from '../Button.jsx';
import { quickToggleListing, fetchUserListings } from '../../services/api';

const DashboardListingsPanel = ({ listings: initial, onEdit, onDelete, onNew }) => {
  const { t } = useTranslation('dashboard');
  const [listings, setListings] = useState(initial);
  const [filter, setFilter] = useState('active');
  const [loading, setLoading] = useState(false);

  const reload = async (f=filter) => {
    setLoading(true);
    try {
      const params = f==='active' ? { params:{ is_active: 1, archived: 0 } }
        : f==='archived' ? { params:{ archived: 1 } }
        : {}; // 'all'
      const res = await fetchUserListings(params);
      setListings(res.data.results || res.data || []);
    } finally { setLoading(false); }
  };

  const onToggle = async (l, action) => {
    try {
      const res = await quickToggleListing(l.id, action);
      const updated = res.data;
      setListings(ls => ls.map(x => x.id===updated.id ? updated : x));
    } catch(e){ console.error(e); alert(t('listings.toggleError','Unable to update status')); }
  };
  return (
    <div className="dash-panel">
      <header className="dash-panel-header row">
        <h2 className="dash-panel-title">{t('listings.title')}</h2>
        <div className="dash-panel-actions">
          <div className="chips">
            <button className={`chip${filter==='active'?' active':''}`} onClick={()=>{ setFilter('active'); reload('active'); }}>{t('listings.filterActive','Active')}</button>
            <button className={`chip${filter==='all'?' active':''}`} onClick={()=>{ setFilter('all'); reload('all'); }}>{t('listings.filterAll','All')}</button>
            <button className={`chip${filter==='archived'?' active':''}`} onClick={()=>{ setFilter('archived'); reload('archived'); }}>{t('listings.filterArchived','Archived')}</button>
          </div>
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
              <Button size="sm" variant="ghost" onClick={() => onToggle(l,'toggle_active')}>{l.is_active? t('listings.deactivate','Deactivate') : t('listings.activate','Activate')}</Button>
              <Button size="sm" variant="ghost" onClick={() => onToggle(l,'toggle_featured')}>{l.is_featured? t('listings.unfeature','Unfeature') : t('listings.feature','Feature')}</Button>
              {!l.archived ? (
                <Button size="sm" variant="secondary" onClick={() => onToggle(l,'archive')}>{t('listings.archive','Archive')}</Button>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => onToggle(l,'unarchive')}>{t('listings.unarchive','Unarchive')}</Button>
              )}
              <Button size="sm" variant="secondary" onClick={() => onDelete?.(l)}>{t('listings.delete')}</Button>
            </div>
          </div>
        ))}
      </div>
      {loading && <div className="dash-loading" role="status" aria-live="polite">{t('common:loading','Loading...')}</div>}
    </div>
  );
};

export default DashboardListingsPanel;
