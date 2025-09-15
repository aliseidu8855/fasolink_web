import React, { useState, useMemo } from 'react';
import Modal from '../Modal.jsx';
import { BF_LOCATIONS } from '../../data/locations.js';
import './LocationPickerModal.css';

// Helper slugify kept in sync with SearchBar
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');

const LocationPickerModal = ({
  isOpen,
  onClose,
  initialRegion,
  initialTown,
  onApply,
  t
}) => {
  const [region, setRegion] = useState(initialRegion || null);
  const [town, setTown] = useState(initialTown || null);
  const [filter, setFilter] = useState('');

  const regions = useMemo(() => {
    const base = !filter.trim() ? BF_LOCATIONS : BF_LOCATIONS.filter(r => {
      const f = filter.toLowerCase();
      return r.region.toLowerCase().includes(f) || r.towns.some(tw => tw.toLowerCase().includes(f));
    });
    // group alphabetically by first letter of region name
    const groups = {};
    base.forEach(r => {
      const letter = r.region.charAt(0).toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(r);
    });
    return Object.keys(groups).sort().map(letter => ({ letter, items: groups[letter] }));
  }, [filter]);

  const visibleTowns = useMemo(() => {
    if (!region) return [];
    if (!filter.trim()) return region.towns;
    const f = filter.toLowerCase();
    return region.towns.filter(tw => tw.toLowerCase().includes(f));
  }, [region, filter]);

  const apply = () => {
    onApply(region, town);
    onClose();
  };

  const clear = () => { setRegion(null); setTown(null); };

  return (
    <Modal isOpen={isOpen} onClose={onClose} contentClassName="location-picker-modal">
      <div className="lpm-shell">
        <div className="lpm-header">
          <h3>{t?.('chooseLocation','Choose a location')}</h3>
          <div className="lpm-search">
            <input
              type="text"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder={t?.('searchLocation','Find region or town...')}
              aria-label={t?.('searchLocation','Find region or town...')}
            />
          </div>
        </div>
        <div className="lpm-body">
          <div className="lpm-regions-col">
            <div className="lpm-regions-scroll">
              {regions.map(group => (
                <div key={group.letter} className="lpm-alpha-group">
                  <div className="lpm-alpha-label">{group.letter}</div>
                  {group.items.map(r => (
                    <button
                      key={r.code}
                      type="button"
                      className={`lpm-region ${region?.code===r.code?'active':''}`}
                      onClick={() => { setRegion(r); setTown(null); }}
                    >
                      <span className="name">{r.region}</span>
                      <span className="cap">{r.capital}</span>
                      <span className="arrow">›</span>
                    </button>
                  ))}
                </div>
              ))}
              {regions.length === 0 && <div className="lpm-empty">{t?.('noResults','No results')}</div>}
            </div>
          </div>
          <div className="lpm-towns-col">
            <div className="lpm-towns-header">
              <h4>{region ? t?.('towns','Towns') : t?.('selectRegion','Select a region')}</h4>
              {region && <span className="region-pill">{region.region}</span>}
            </div>
            <div className="lpm-towns-scroll">
              {region && visibleTowns.map(tw => (
                <button
                  key={slugify(tw)}
                  type="button"
                  className={`lpm-town ${town===tw?'active':''}`}
                  onDoubleClick={() => { setTown(tw); apply(); }}
                  onClick={() => { setTown(tw); }}
                >{tw}</button>
              ))}
              {region && visibleTowns.length === 0 && <div className="lpm-empty">{t?.('noResults','No results')}</div>}
              {!region && <div className="lpm-placeholder">{t?.('selectRegion','Select a region')}</div>}
            </div>
          </div>
        </div>
        <div className="lpm-footer">
          <button type="button" className="clear" onClick={clear} disabled={!region && !town}>{t?.('clear','Clear')}</button>
          <button type="button" className="cancel" onClick={onClose}>{t?.('close','Close')}</button>
          <button type="button" className="apply" onClick={apply}>{t?.('apply','Apply')}</button>
        </div>
      </div>
    </Modal>
  );
};

export default LocationPickerModal;