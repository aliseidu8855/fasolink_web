import React, { useState, useEffect, useRef } from 'react';
import './SearchableSelect.css';

/** Accessible searchable select (combobox pattern) */
export default function SearchableSelect({ label, options, value, onChange, placeholder='Select...', noResults='No results', maxHeight=220 }) {
  const [open,setOpen]=useState(false);
  const [query,setQuery]=useState('');
  const [activeIndex,setActiveIndex]=useState(0);
  const btnRef=useRef(null); const listRef=useRef(null);

  const filtered = query.trim() ? options.filter(o=> o.toLowerCase().includes(query.toLowerCase())) : options;
  useEffect(()=> { if(!open){ setQuery(''); setActiveIndex(0);} },[open]);

  const commit = (val) => { onChange(val); setOpen(false); btnRef.current?.focus(); };

  const onKeyDown = (e) => {
    if(!open){
      if(['ArrowDown','Enter',' '].includes(e.key)){ e.preventDefault(); setOpen(true); }
      return;
    }
    if(e.key==='Escape'){ e.preventDefault(); setOpen(false); return; }
    if(e.key==='ArrowDown'){ e.preventDefault(); setActiveIndex(i=> Math.min(filtered.length-1, i+1)); }
    else if(e.key==='ArrowUp'){ e.preventDefault(); setActiveIndex(i=> Math.max(0, i-1)); }
    else if(e.key==='Enter'){ e.preventDefault(); const opt=filtered[activeIndex]; if(opt) commit(opt); }
  };

  return (
    <div className="cl-combobox" onKeyDown={onKeyDown}>
      {label && <label className="cl-combobox-label">{label}</label>}
      <div className={`cl-combobox-control${open?' open':''}`}>
        <button ref={btnRef} type="button" className="cl-combobox-button" aria-haspopup="listbox" aria-expanded={open} onClick={()=> setOpen(o=> !o)}>
          <span>{value || placeholder}</span>
          <span className="cl-caret" aria-hidden>▾</span>
        </button>
        {open && (
          <div className="cl-combobox-pop" role="dialog">
            <input autoFocus className="cl-combobox-input" placeholder={placeholder} value={query} onChange={e=> { setQuery(e.target.value); setActiveIndex(0); }} />
            <ul ref={listRef} role="listbox" className="cl-combobox-list" style={{maxHeight}}>
              {filtered.length===0 && <li className="cl-empty">{noResults}</li>}
              {filtered.map((opt,i)=> {
                const selected = opt===value; const active = i===activeIndex;
                return (
                  <li key={opt} id={`loc-opt-${i}`} role="option" aria-selected={selected} className={`cl-option${selected?' selected':''}${active?' active':''}`} onMouseEnter={()=> setActiveIndex(i)} onClick={()=> commit(opt)}>
                    {opt}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
