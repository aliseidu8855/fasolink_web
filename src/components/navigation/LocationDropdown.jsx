import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { BF_LOCATIONS } from '../../data/locations.js';
import './LocationDropdown.css';

// Util: slugify same as used in SearchBar / modal (duplicate minimal to avoid circular dep)
const slugify = str => str.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[^a-z0-9]+/g,'_').replace(/(^_|_$)/g,'');

/*
Amazon-style location selector (two-column) contract:
Props:
- open (bool)
- onClose()
- anchorRef (ref to trigger element to align)
- onApply(regionObj, townString|null, composedSlugString)
- currentValue: { regionCode, townSlug }
- t: translation function (optional)
*/

const LocationDropdown = ({ open, onClose, anchorRef, onApply, currentValue, t }) => {
  const panelRef = useRef(null);
  const [activeRegion, setActiveRegion] = useState(null);
  const [filter, setFilter] = useState('');
  // (Optional future) filter state removed for now to keep component lean
  const [focusIndex, setFocusIndex] = useState(0);
  const [townFocus, setTownFocus] = useState(0);
  const [townMode, setTownMode] = useState(false); // whether second column is visible

  // Preselect based on current value
  useEffect(() => {
    if (!open) return;
    if (currentValue?.regionCode) {
      const r = BF_LOCATIONS.find(r=>r.code===currentValue.regionCode);
      setActiveRegion(r || null);
      setTownMode(!!r);
    } else {
      setActiveRegion(null);
      setTownMode(false);
    }
  }, [open, currentValue]);

  // Regions list with filter
  const regions = useMemo(() => {
    const base = [...BF_LOCATIONS];
    base.sort((a,b)=> a.region.localeCompare(b.region));
    if (!filter.trim()) return base;
    const f = filter.toLowerCase();
    return base.filter(r => r.region.toLowerCase().includes(f) || r.capital.toLowerCase().includes(f) || r.towns.some(tw=>tw.toLowerCase().includes(f)));
  }, [filter]);

  const towns = useMemo(()=> activeRegion ? activeRegion.towns : [], [activeRegion]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = e => {
      if (panelRef.current && !panelRef.current.contains(e.target) && !anchorRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose, anchorRef]);

  // Keyboard navigation
  const onKey = useCallback((e) => {
    if (!open) return;
    if (e.key === 'Escape') { onClose(); return; }
    if (!townMode) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setFocusIndex(i=> Math.min(regions.length-1, i+1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusIndex(i=> Math.max(0, i-1)); }
      else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        const r = regions[focusIndex];
        if (r) { setActiveRegion(r); setTownMode(true); setTownFocus(0); }
      }
    } else {
      if (e.key === 'ArrowLeft') { e.preventDefault(); setTownMode(false); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setTownFocus(i=> Math.min(towns.length-1, i+1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setTownFocus(i=> Math.max(0, i-1)); }
      else if (e.key === 'Enter') {
        const town = towns[townFocus];
        if (town) {
          const slug = activeRegion.code + ':' + slugify(town);
          onApply(activeRegion, town, slug);
          onClose();
        }
      }
    }
  }, [open, townMode, regions, focusIndex, towns, townFocus, activeRegion, onApply, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onKey]);

  if (!open) return null;

  // Position panel relative to anchor (basic left align). Could add dynamic width adjustments later.
  const anchorRect = anchorRef.current?.getBoundingClientRect();
  const style = anchorRect ? {
    position:'absolute',
    top: anchorRef.current.offsetHeight + 4,
    left: 0,
    maxHeight: 380,
    overflow: 'hidden'
  } : {};

  const applyRegionOnly = (r) => {
    onApply(r, null, r.code);
    onClose();
  };

  const clear = () => { onApply(null,null,''); onClose(); };

  return (
    <div className="location-dropdown-root" style={style} ref={panelRef} role="dialog" aria-label={t?.('chooseLocation','Choose location')}>
      <div className="location-dropdown-panel" style={{maxHeight: 380, overflow: 'hidden'}}>
        <div className="location-dropdown-col" role="listbox" aria-label={t?.('regions','Regions')} style={{maxHeight: 360, overflowY: 'auto'}}>
          {!townMode && (
            <div style={{padding:'6px 8px 4px'}}>
              <input
                type="text"
                placeholder={t?.('searchLocation','Filter...')}
                value={filter}
                onChange={e=>{ setFilter(e.target.value); setFocusIndex(0);} }
                style={{width:'100%', fontSize:11, padding:'6px 8px', border:'1px solid rgba(0,0,0,0.25)', borderRadius:6}}
                autoFocus
              />
            </div>
          )}
          <button className="location-dropdown-back" style={{display: townMode? 'block':'none'}} onClick={()=> setTownMode(false)}>&larr; {t?.('regions','Regions')}</button>
          {!townMode && regions.map((r, idx) => {
            const active = r.code === activeRegion?.code;
            return (
              <button
                key={r.code}
                type="button"
                className={`location-option ${active? 'active':''}`}
                aria-selected={idx===focusIndex}
                onMouseEnter={()=> setFocusIndex(idx)}
                onClick={() => {
                  // If clicking same region again apply it directly (region-only) OR if it has zero towns (edge-case)
                  if (active && (!r.towns || r.towns.length === 0)) {
                    applyRegionOnly(r);
                    return;
                  }
                  if (active) { applyRegionOnly(r); return; }
                  setActiveRegion(r); setTownMode(true); setTownFocus(0);
                }}
              >
                <span>{r.region}</span>
                <span className="count" aria-hidden="true">{r.towns.length}</span>
                <span className="small">{r.capital}</span>
                <span className="arrow">›</span>
              </button>
            );
          })}
          {!townMode && regions.length===0 && <div className="location-dropdown-empty">{t?.('noResults','No results')}</div>}

          {!townMode && (
            <div style={{marginTop:'4px', padding:'4px 6px', display:'flex', gap:'6px'}}>
              <button type="button" style={{flex:1, fontSize:'10px'}} onClick={clear}>{t?.('clear','Clear')}</button>
            </div>
          )}
        </div>
        {townMode && (
          <div className="location-dropdown-col" role="listbox" aria-label={t?.('towns','Towns')} style={{maxHeight: 360, overflowY: 'auto'}}>
            {towns.map((tw, idx) => {
              const active = idx === townFocus;
              return (
                <button
                  key={slugify(tw)}
                  type="button"
                  className={`location-option ${active? 'active':''}`}
                  aria-selected={active}
                  onMouseEnter={()=> setTownFocus(idx)}
                  onClick={() => { const slug = activeRegion.code + ':' + slugify(tw); onApply(activeRegion, tw, slug); onClose(); }}
                >
                  <span>{tw}</span>
                </button>
              );
            })}
            {towns.length===0 && <div className="location-dropdown-empty">{t?.('noResults','No results')}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationDropdown;
