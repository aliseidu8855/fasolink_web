import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FilterSidebar from '../FilterSidebar';
import { CloseIcon } from '../icons/Icons';
import './FilterBottomSheet.css';

// Full-height bottom sheet for advanced filters on mobile; can be used on desktop as modal
// Props: open (bool), initialFilters (object), onClose(), onApply(filters)
export default function FilterBottomSheet({ open, initialFilters, onClose, onApply }) {
  const { t } = useTranslation(['listing','common']);
  const [localFilters, setLocalFilters] = useState(initialFilters || {});
  const sheetRef = useRef(null);

  useEffect(() => {
    setLocalFilters(initialFilters || {});
  }, [initialFilters]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const apply = () => { onApply?.(localFilters); onClose?.(); };

  return (
    <div className={`sheet-overlay ${open ? 'open' : ''}`} aria-hidden={!open}>
      <div className="sheet" ref={sheetRef} role="dialog" aria-modal="true" aria-label={t('listing:filtersTitle','Filters')}>
        <div className="sheet-header">
          <h3>{t('listing:filtersTitle','Filters')}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={t('common:close','Close')}><CloseIcon size={18} /></button>
        </div>
        <div className="sheet-body">
          <FilterSidebar onFilterChange={setLocalFilters} autoApply={false} initialFilters={initialFilters} />
        </div>
        <div className="sheet-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>{t('common:cancel','Cancel')}</button>
          <button type="button" className="btn-primary" onClick={apply}>{t('listing:applyFilters','Apply Filters')}</button>
        </div>
      </div>
    </div>
  );
}
