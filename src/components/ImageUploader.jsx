import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './ImageUploader.css';

/** ImageUploader with previews, remove & reorder (via up/down buttons).
 * props: value (File[]) | onChange(files[]) | max (number)
 */
export default function ImageUploader({ value=[], onChange, max=5, label='Images' }) {
  const { t } = useTranslation('createListing');
  const inputRef = useRef(null);
  const [dragIndex,setDragIndex]=useState(null);
  const liveRef = useRef(null);
  const files = value;

  const announce = (msg) => {
    if(liveRef.current){
      liveRef.current.textContent = msg;
    }
  };

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    const merged = [...files, ...incoming].slice(0,max);
    onChange(merged);
    if(incoming.length){
      announce(t('imageAddedCount', { count: Math.min(incoming.length, max - files.length) }));
    }
  };

  const removeAt = (idx) => {
    const name = files[idx]?.name;
    onChange(files.filter((_,i)=> i!==idx));
    announce(t('imageRemoved',{ name: name || '' }));
  };
  const move = (from, to) => {
    if(to<0 || to>=files.length) return;
    const next=[...files]; const [f]=next.splice(from,1); next.splice(to,0,f); onChange(next);
    announce(t('imageMoved', { from: from+1, to: to+1, name: f.name }));
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragIndex(null); addFiles(e.dataTransfer.files);
  };

  return (
    <div className="cl-uploader" onDragOver={e=> {e.preventDefault();}} onDrop={handleDrop}>
      <div className="cl-uploader-header">
        <span className="cl-uploader-label">{label} ({files.length}/{max})</span>
        <button type="button" className="cl-uploader-add" onClick={()=> inputRef.current?.click()} disabled={files.length>=max}>+ {t('imageAdd')}</button>
        <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={e=> { addFiles(e.target.files); e.target.value=''; }} />
      </div>
      {files.length===0 && <div className="cl-uploader-empty">{t('imagesHelp')} (max {max})</div>}
      <p className="visually-hidden" id="image-reorder-help">{t('imagesHelp')}</p>
      <ul className="cl-uploader-grid" role="list" aria-describedby="image-reorder-help">
        {files.map((f,i)=> {
          const url = URL.createObjectURL(f);
          return (
            <li key={i} className="cl-uploader-item" draggable onDragStart={()=> setDragIndex(i)} onDragEnd={()=> setDragIndex(null)} onDrop={(e)=> {e.preventDefault(); if(dragIndex!=null && dragIndex!==i) move(dragIndex,i);}}>
              <div className="cl-thumb-wrap"><img src={url} alt={f.name} /></div>
              <div className="cl-uploader-actions">
                <button type="button" onClick={()=> move(i,i-1)} aria-label={t('imageMoveUp')} disabled={i===0}>↑</button>
                <button type="button" onClick={()=> move(i,i+1)} aria-label={t('imageMoveDown')} disabled={i===files.length-1}>↓</button>
                <button type="button" onClick={()=> removeAt(i)} aria-label={t('imageRemove')}>✕</button>
              </div>
            </li>
          );
        })}
      </ul>
      <div ref={liveRef} className="visually-hidden" role="status" aria-live="polite" aria-atomic="true"></div>
    </div>
  );
}
