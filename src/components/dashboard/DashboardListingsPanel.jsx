import React, { useEffect, useState } from 'react';
import ListingCard from '../ListingCard.jsx';
import { useTranslation } from 'react-i18next';
import EmptyState from '../ui/EmptyState.jsx';
import Button from '../Button.jsx';
import { quickToggleListing, fetchUserListings } from '../../services/api';
import BottomSheet from '../sheet/BottomSheet.jsx';

const DashboardListingsPanel = ({ listings: initial, onEdit, onDelete, onNew }) => {
  const { t } = useTranslation('dashboard');
  const [listings, setListings] = useState(initial);
  const [filter, setFilter] = useState('active');
  const [loading, setLoading] = useState(false);
  const [manageFor, setManageFor] = useState(null);

  // Keep internal listings in sync with parent updates
  useEffect(()=>{ setListings(initial); }, [initial]);

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
      setManageFor(m => (m && m.id===updated.id) ? updated : m);
    } catch(e){ console.error(e); alert(t('listings.toggleError','Unable to update status')); }
  };
  return (
    <div className="dash-panel">
      <header className="dash-panel-header row">
        <h2 className="dash-panel-title">{t('listings.title')}</h2>
        <div className="dash-panel-actions">
          <div className="chips chips-scroll" role="tablist" aria-label={t('listings.filters','Filters')}>
            <button role="tab" className={`chip${filter==='active'?' active':''}`} onClick={()=>{ setFilter('active'); reload('active'); }}>{t('listings.filterActive','Active')}</button>
            <button role="tab" className={`chip${filter==='all'?' active':''}`} onClick={()=>{ setFilter('all'); reload('all'); }}>{t('listings.filterAll','All')}</button>
            <button role="tab" className={`chip${filter==='archived'?' active':''}`} onClick={()=>{ setFilter('archived'); reload('archived'); }}>{t('listings.filterArchived','Archived')}</button>
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
              <Button size="sm" variant="ghost" onClick={() => setManageFor(l)}>{t('listings.manage','Manage')}</Button>
            </div>
          </div>
        ))}
      </div>
      {loading && <div className="dash-loading" role="status" aria-live="polite">{t('common:loading','Loading...')}</div>}
      {/* Floating Create CTA for mobile */}
      <button className="fab-create" onClick={onNew} aria-label={t('listings.new','New listing')}>+</button>

      {/* Manage bottom sheet */}
      <BottomSheet
        open={!!manageFor}
        title={t('listings.manageTitle','Manage listing')}
        onClose={()=> setManageFor(null)}
        footer={<Button variant="secondary" onClick={()=> setManageFor(null)}>{t('common:close','Close')}</Button>}
      >
        {manageFor && (
          <div className="manage-actions" style={{display:'flex', flexDirection:'column', gap:'.5rem'}}>
            <Button style={{width:'100%'}} onClick={() => { onEdit?.(manageFor); setManageFor(null); }}>{t('listings.edit','Edit')}</Button>
            <Button style={{width:'100%'}} variant="ghost" onClick={() => { onToggle(manageFor,'toggle_active'); }}>
              {manageFor.is_active? t('listings.deactivate','Deactivate') : t('listings.activate','Activate')}
            </Button>
            <Button style={{width:'100%'}} variant="ghost" onClick={() => { onToggle(manageFor,'toggle_featured'); }}>
              {manageFor.is_featured? t('listings.unfeature','Unfeature') : t('listings.feature','Feature')}
            </Button>
            {!manageFor.archived ? (
              <Button style={{width:'100%'}} variant="secondary" onClick={() => { onToggle(manageFor,'archive'); }}>{t('listings.archive','Archive')}</Button>
            ) : (
              <Button style={{width:'100%'}} variant="secondary" onClick={() => { onToggle(manageFor,'unarchive'); }}>{t('listings.unarchive','Unarchive')}</Button>
            )}
            <Button style={{width:'100%'}} variant="secondary" onClick={() => { onDelete?.(manageFor); setManageFor(null); }}>{t('listings.delete','Delete')}</Button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

export default DashboardListingsPanel;
