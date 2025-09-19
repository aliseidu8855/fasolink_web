import React, { useEffect, useRef } from 'react';
import './BottomSheet.css';

export default function BottomSheet({ open, title, onClose, children, footer }){
  const sheetRef = useRef(null);
  const lastFocus = useRef(null);

  useEffect(() => {
    if (open) {
      lastFocus.current = document.activeElement;
      // focus the sheet container
      requestAnimationFrame(() => {
        sheetRef.current?.focus();
      });
      // prevent background scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      lastFocus.current?.focus?.();
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const onKey = (e) => {
      if (!open) return;
      if (e.key === 'Escape') { onClose?.(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="bs-overlay" role="dialog" aria-modal="true" aria-labelledby="bs-title">
      <div className="bs-panel" ref={sheetRef} tabIndex={-1}>
        <div className="bs-handle" aria-hidden="true"><span /></div>
        <div className="bs-header">
          <h2 id="bs-title">{title}</h2>
          <button className="bs-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="bs-content">
          {children}
        </div>
        {footer && (
          <div className="bs-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
