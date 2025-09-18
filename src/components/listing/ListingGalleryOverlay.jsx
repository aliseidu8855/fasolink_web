import React, { useEffect, useRef, useState } from 'react';
import { CloseIcon } from '../icons/Icons';
import './ListingGalleryOverlay.css';

export default function ListingGalleryOverlay({ images = [], startIndex = 0, open, onClose }) {
  const [index, setIndex] = useState(startIndex || 0);
  const containerRef = useRef(null);

  useEffect(() => { if (open) setIndex(startIndex || 0); }, [open, startIndex]);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); if (e.key === 'ArrowRight') setIndex(i=>Math.min(i+1, images.length-1)); if (e.key === 'ArrowLeft') setIndex(i=>Math.max(i-1,0)); };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, images.length, onClose]);

  if (!open) return null;
  const current = images[index]?.image || images[index]?.url || images[index];

  return (
    <div className="lgov" ref={containerRef} role="dialog" aria-modal="true">
      <button type="button" className="lgov-close" onClick={onClose} aria-label="Close"><CloseIcon size={20} /></button>
      <div className="lgov-stage" onClick={onClose}>
        {current && (
          <img src={current} alt="" className="lgov-img" onClick={(e)=>e.stopPropagation()} />
        )}
      </div>
      <div className="lgov-controls" aria-hidden>
        <button type="button" className="lgov-prev" onClick={(e)=>{ e.stopPropagation(); setIndex(i=>Math.max(0,i-1)); }} disabled={index<=0}>‹</button>
        <button type="button" className="lgov-next" onClick={(e)=>{ e.stopPropagation(); setIndex(i=>Math.min(images.length-1,i+1)); }} disabled={index>=images.length-1}>›</button>
      </div>
      <div className="lgov-count">{index+1}/{images.length}</div>
    </div>
  );
}
