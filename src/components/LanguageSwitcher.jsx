import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => { if (open && ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const selectLng = (lng) => { i18n.changeLanguage(lng); setOpen(false); };
  const current = i18n.language?.startsWith('fr') ? 'FR' : 'EN';

  return (
    <div className="lang-switch" ref={ref}>
      <button className="lang-trigger" aria-haspopup="listbox" aria-expanded={open} onClick={()=>setOpen(o=>!o)}>
        <span className="lang-code">{current}</span>
        <span className="caret" aria-hidden="true">▾</span>
      </button>
      {open && (
        <ul className="lang-dropdown" role="listbox" aria-label="Select language">
          <li>
            <button type="button" role="option" aria-selected={current==='FR'} onClick={()=>selectLng('fr')} className={current==='FR'? 'active':''}>FR</button>
          </li>
          <li>
            <button type="button" role="option" aria-selected={current==='EN'} onClick={()=>selectLng('en')} className={current==='EN'? 'active':''}>EN</button>
          </li>
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;