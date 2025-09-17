import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchSpecsMetadata, fetchCategories, createListing } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Stepper from '../components/Stepper';
import ImageUploader from '../components/ImageUploader';
import { BF_LOCATIONS } from '../data/locations.js';
import './CreateListingPage.css';
// Categories are now loaded dynamically from the backend and selected by id.
const STEP_KEYS = ['category','core','specs','review'];

export default function CreateListingPage(){
  const { t } = useTranslation(['createListing','common']);
  const nav = useNavigate();
  const [allCats,setAllCats] = useState([]);
  const [selectedCategoryId,setSelectedCategoryId] = useState(null);
  const [step,setStep]=useState('category');
  const [title,setTitle]=useState('');
  const [price,setPrice]=useState('');
  const [negotiable,setNegotiable]=useState(false);
  const [desc,setDesc]=useState('');
  const [loc,setLoc]=useState(''); // stored listing location string (region or town)
  const [selectedRegionCode,setSelectedRegionCode]=useState('');
  const [selectedTown,setSelectedTown]=useState('');
  const [contactPhone,setContactPhone]=useState('');
  // removed allLocations (using curated BF_LOCATIONS)
  const [specMeta,setSpecMeta]=useState([]);
  const [specValues,setSpecValues]=useState({});
  const [images,setImages]=useState([]); // File[]
  const [submitting,setSubmitting]=useState(false);
  const [submitError,setSubmitError]=useState(null);
  const [fieldErrors,setFieldErrors]=useState({}); // backend field -> messages[]
  const [specErrors,setSpecErrors]=useState({}); // spec key -> message
  const [createdId,setCreatedId]=useState(null);
  const firstErrorRef = useRef(null);

  useEffect(()=>{ fetchCategories().then(r=> setAllCats(r.data)); },[]);
  // Load specs metadata for selected category name if available; otherwise none
  useEffect(()=>{
    if(selectedCategoryId){
      const cat = allCats.find(c=> c.id===selectedCategoryId);
      const name = cat?.name;
      if(name){
        fetchSpecsMetadata(name).then(r=> setSpecMeta(r.data.specs||[])).catch(()=> setSpecMeta([]));
      } else {
        setSpecMeta([]);
      }
    } else {
      setSpecMeta([]);
    }
  },[selectedCategoryId, allCats]);
  // Load distinct locations once (empty query) when entering core step or on mount
  // Build curated list from BF_LOCATIONS (region + towns) instead of backend distinct list
  // (curated list derived directly where needed, no variable retained)

  // Sync combined location string for submission (prefer town then region)
  useEffect(()=> {
    if(selectedTown){
      setLoc(selectedTown);
    } else if(selectedRegionCode){
      const region = BF_LOCATIONS.find(r=> r.code===selectedRegionCode);
      setLoc(region? region.region : '');
    } else {
      setLoc('');
    }
  },[selectedTown, selectedRegionCode]);

  // Flat list of categories from backend
  const visibleCategories = allCats;

  const requiredSpecsValid = specMeta.filter(s=> s.required).every(s=> {
    const v = specValues[s.key];
    return (v!==undefined && v!==null && v!=='' && !(typeof v==='string' && v.trim()===''));
  });
  const canNext = step==='category'
    ? !!selectedCategoryId
    : step==='core'
      ? (title.trim().length>4 && price && loc && desc.trim().length>0)
      : step==='specs'
        ? requiredSpecsValid
        : true;

  // First error message for aria-live
  const firstErrorMessage = useMemo(()=>{
    if(step==='core'){
      if(!title || title.trim().length<=4) return t('createListing:title') + ' ' + t('createListing:required');
      if(!price) return t('createListing:price') + ' ' + t('createListing:required');
      if(!loc) return t('createListing:location') + ' ' + t('createListing:required');
    }
    if(step==='specs'){
      const missing = specMeta.find(s=> s.required && (specValues[s.key]===undefined || specValues[s.key]===''));
      if(missing) return missing.name + ' ' + t('createListing:required');
    }
    if(step==='category' && !selectedCategoryId) return t('createListing:category') + ' ' + t('createListing:required');
    return '';
  },[step, title, price, loc, selectedCategoryId, specMeta, specValues, t]);

  const handleAttemptNext = () => {
    if(canNext){ goNext(); return; }
    setTimeout(()=> { firstErrorRef.current?.focus(); }, 30);
    // Announce error message by updating live region (state already derived)
  };

  // Debounce price normalization (strip leading zeros)
  useEffect(()=>{
    if(!price) return;
    const h = setTimeout(()=> {
      setPrice(p=> {
        if(!p) return p;
        // keep decimal part, normalize leading zeros
        const norm = p.replace(/^0+(?=\d)/,'');
        return norm || p;
      });
    }, 300);
    return ()=> clearTimeout(h);
  },[price]);

  const goNext = () => { if(!canNext) return; setStep(p=> STEP_KEYS[STEP_KEYS.indexOf(p)+1]); };
  const goPrev = () => setStep(p=> STEP_KEYS[STEP_KEYS.indexOf(p)-1] || 'category');

  const stepItems = useMemo(()=> [
  { key:'category', label: t('createListing:step_category','Category') },
  { key:'core', label: t('createListing:step_core','Core') },
  { key:'specs', label: t('createListing:step_specs','Specs') },
  { key:'review', label: t('createListing:step_review','Review') }
  ],[t]);

  const currentStepIndex = STEP_KEYS.indexOf(step);
  const handleStepSelect = (key) => {
    const idx = STEP_KEYS.indexOf(key);
    if(idx === -1) return;
    // Allow going back freely, disallow jumping ahead unless all prior steps valid
    if(idx < currentStepIndex) setStep(key);
  };

  const onSubmit = async () => {
    // Extra guard: ensure auth token exists (should be enforced by ProtectedRoute already)
    const authToken = localStorage.getItem('authToken');
    if(!authToken){
      setFieldErrors(prev => ({ ...prev, _non: t('createListing:mustLogin','Please login to post an ad.') }));
      setStep('review');
      return;
    }
    if(!selectedCategoryId){
      setFieldErrors({ category: t('createListing:required') });
      setStep('category');
      return;
    }
    if(!desc.trim()){
      setFieldErrors(prev=> ({...prev, description: t('createListing:required')}));
      setStep('core');
      return;
    }
    setSubmitting(true); setSubmitError(null); setFieldErrors({}); setSpecErrors({});
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('price', price);
      fd.append('description', desc);
    fd.append('location', loc);
    fd.append('category', selectedCategoryId || '');
      fd.append('negotiable', negotiable?'true':'false');
      if (contactPhone && contactPhone.trim()) {
        fd.append('contact_phone', contactPhone.trim());
      }
      const attrs = Object.keys(specValues).filter(k=> {
        const v = specValues[k];
        return v!=='' && v!=null;
      }).map(k=> ({ name:k, value: specValues[k] }));
      if (attrs.length > 0) {
        fd.append('attributes', JSON.stringify(attrs));
      }
      images.forEach(img=> fd.append('uploaded_images', img));
      const res = await createListing(fd);
      setCreatedId(res.data.id);
      setStep('review');
    } catch(e){
      const status = e.response?.status;
      const data = e.response?.data;
      if(data && typeof data === 'object'){
        const fe = {}; const se = {};
        // Surface global error messages
        if (data.detail) {
          fe._non = Array.isArray(data.detail) ? data.detail.join(' ') : String(data.detail);
        }
        Object.entries(data).forEach(([k,v])=> {
          if(k==='attributes' && Array.isArray(v)){
            // attributes errors may come as list-level; show generic
            se._generic = Array.isArray(v)? v.join(' '): String(v);
          } else if(k==='non_field_errors'){
            fe._non = Array.isArray(v)? v.join(' '): String(v);
          } else if(k!=='detail') {
            // core field or maybe spec key
            if(specMeta.find(s=> s.key===k)) se[k] = Array.isArray(v)? v[0]: String(v);
            else fe[k] = Array.isArray(v)? v[0]: String(v);
          }
        });
        // Auth specific messaging
        if ((status === 401 || status === 403) && !fe._non) {
          fe._non = t('createListing:authRequired','Authentication required. Please log in and try again.');
        }
  // Store raw backend errors for visibility
  console.error('Create listing error:', data);
  setFieldErrors(fe); setSpecErrors(se); setSubmitError(JSON.stringify(data));
        if(fe.category){ setStep('category'); }
        else if(fe.title || fe.price || fe.location || fe.description || fe.contact_phone){ setStep('core'); }
        else if(Object.keys(se).length>0){ setStep('specs'); }
        else { setStep('review'); }
      } else if (e.request && !e.response) {
        // Network error (CORS, offline, DNS, etc.)
        setSubmitError('Network error. Please check your connection and try again.');
      } else {
        setSubmitError(data || 'Failed');
      }
    }
    finally { setSubmitting(false); }
  };

  return (
    <div className="container create-listing-page" role="main">
  <h1 className="cl-title">{t('createListing:postAd')}</h1>
      <div className="cl-layout">
  <aside className="cl-side-stepper" aria-label={t('createListing:steps')}>
          <Stepper steps={stepItems} current={step} onSelect={handleStepSelect} />
        </aside>
        <div className="cl-main">
      {step==='category' && (
        <section className="cl-panel" aria-labelledby="cl-cat-h">
          <div className="cl-cat-bar">
            <h2 id="cl-cat-h" className="cl-cat-heading">{t('createListing:chooseCategory','Choose a category')}</h2>
          </div>
          <ul className="cl-cat-grid" role="listbox">
            {visibleCategories.map((c)=> {
              const selected = selectedCategoryId === c.id;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    className={`cl-cat-btn${selected?' selected':''}`}
                    onClick={()=> setSelectedCategoryId(c.id)}
                    aria-selected={selected||undefined}
                  >
                    <span className="cl-cat-label">{c.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {selectedCategoryId && <div className="cl-cat-selection-preview">{t('createListing:category','Category')}: <strong>{allCats.find(c=> c.id===selectedCategoryId)?.name}</strong></div>}
        </section>
      )}
      {step==='core' && (
        <section className="cl-panel" aria-labelledby="cl-core-h">
          <h2 id="cl-core-h">{t('createListing:coreDetails','Core details')}</h2>
          <div className="cl-field">
            <label htmlFor="cl-title">{t('createListing:title')}*</label>
            <input id="cl-title" value={title} aria-invalid={title.trim().length<=4 || undefined} ref={title.trim().length<=4 && !firstErrorRef.current ? firstErrorRef : undefined} onChange={e=> setTitle(e.target.value)} />
            <small className="cl-hint">5+ chars</small>
            {fieldErrors.title && <span className="cl-err-msg" role="alert">{fieldErrors.title}</span>}
          </div>
          <div className="cl-field">
            <label htmlFor="cl-price">{t('createListing:price')}*</label>
            <div className="cl-input-adorn">
              <input id="cl-price" value={price} aria-invalid={!price || undefined} ref={!price && !firstErrorRef.current ? firstErrorRef : undefined} onChange={e=> setPrice(e.target.value.replace(/[^0-9.]/g,''))} inputMode="decimal" min="0" step="0.01" />
              <span className="cl-adorn">CFA</span>
            </div>
            <small className="cl-hint">Numeric</small>
            {fieldErrors.price && <span className="cl-err-msg" role="alert">{fieldErrors.price}</span>}
          </div>
          <div className="cl-field">
            <label>{t('createListing:location')}*</label>
            <div className="cl-loc-row">
              <select value={selectedRegionCode} onChange={e=> { setSelectedRegionCode(e.target.value); setSelectedTown(''); }}>
                <option value="">{t('createListing:selectRegion')}</option>
                {BF_LOCATIONS.map(r=> <option key={r.code} value={r.code}>{r.region}</option>)}
              </select>
              <select value={selectedTown} onChange={e=> setSelectedTown(e.target.value)} disabled={!selectedRegionCode}>
                <option value="">{t('createListing:selectTown')}</option>
                {selectedRegionCode && BF_LOCATIONS.find(r=> r.code===selectedRegionCode)?.towns.map(tw=> <option key={tw} value={tw}>{tw}</option>)}
              </select>
            </div>
            <p className="cl-field-hint">{t('createListing:locationHint')}</p>
            {fieldErrors.location && <span className="cl-err-msg" role="alert">{fieldErrors.location}</span>}
          </div>
          <div className="cl-field"><label htmlFor="cl-phone">{t('createListing:contactPhone')}</label><input id="cl-phone" value={contactPhone} onChange={e=> setContactPhone(e.target.value)} placeholder={t('createListing:contactPhonePlaceholder')} />{fieldErrors.contact_phone && <span className="cl-err-msg" role="alert">{fieldErrors.contact_phone}</span>}</div>
          <div className="cl-field cl-check"><label><input type="checkbox" checked={negotiable} onChange={e=> setNegotiable(e.target.checked)} /> {t('createListing:negotiable','Negotiable')}</label></div>
          <div className="cl-field">
            <label htmlFor="cl-desc">{t('createListing:description','Description')}*</label>
            <textarea id="cl-desc" rows={5} value={desc} aria-invalid={!desc.trim() || undefined} onChange={e=> setDesc(e.target.value)} maxLength={2000} />
            <small className="cl-hint">Required</small>
            {fieldErrors.description && <span className="cl-err-msg" role="alert">{fieldErrors.description}</span>}
            {!fieldErrors.description && !desc.trim() && <span className="cl-err-msg" role="alert">{t('createListing:required')}</span>}
          </div>
          <div className="cl-field">
            <ImageUploader value={images} onChange={setImages} label={t('createListing:images')} max={5} />
            <span className="visually-hidden" aria-live="polite">{t('createListing:imagesHelp')}</span>
          </div>
        </section>
      )}
      {step==='specs' && (
        <section className="cl-panel" aria-labelledby="cl-specs-h">
           <h2 id="cl-specs-h">{t('createListing:specifications')}</h2>
          <div className="cl-spec-grid">
            {specMeta.map(m=> {
              const v = specValues[m.key];
              const invalid = m.required && (v===undefined || v===null || v==='');
              const commonLabel = <label>{m.name}{m.required && ' *'}</label>;
              const setVal = (val) => setSpecValues(o=> ({...o,[m.key]: val}));
              let field = null;
              switch(m.type){
                case 'number':
                  field = <input type="number" aria-invalid={invalid || undefined} value={v || ''} onChange={e=> setVal(e.target.value)} aria-required={m.required||undefined} />; break;
                case 'select':
                  field = (
                    <select aria-invalid={invalid || undefined} value={v || ''} onChange={e=> setVal(e.target.value)} aria-required={m.required||undefined}>
                      <option value="">{t('createListing:selectOption')}</option>
                      {(m.options||[]).map(opt=> <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  );
                  break;
                case 'boolean':
                  field = (
                    <label className="cl-boolean-field">
                      <input type="checkbox" checked={!!v} onChange={e=> setVal(e.target.checked)} /> {m.name}{m.required && ' *'}
                    </label>
                  );
                  break;
                default: // text
                  field = <input type="text" aria-invalid={invalid || undefined} value={v || ''} onChange={e=> setVal(e.target.value)} aria-required={m.required||undefined} />;
              }
              const backendErr = specErrors[m.key];
              return (
                <div key={m.key} className={`cl-spec-field${(invalid || backendErr)?' invalid':''}`}>
                  {m.type==='boolean' ? field : (<>{commonLabel}{field}</>)}
                  {invalid && <span className="cl-err-msg">{t('createListing:required')}</span>}
                  {!invalid && backendErr && <span className="cl-err-msg" role="alert">{backendErr}</span>}
                </div>
              );
            })}
            {specErrors._generic && <div className="cl-err-msg" role="alert">{specErrors._generic}</div>}
          </div>
        </section>
      )}
      {step==='review' && (
        <section className="cl-panel" aria-labelledby="cl-review-h">
           <h2 id="cl-review-h">{t('createListing:review')}</h2>
          {createdId ? (
            <div className="cl-success-box">
              <p>{t('createListing:success')}</p>
              <Button onClick={()=> nav(`/listings/${createdId}`)}>{t('createListing:viewListing')}</Button>
            </div>
          ) : (
            <div className="cl-summary">
              <p><strong>{t('createListing:category')}:</strong> {allCats.find(c=> c.id===selectedCategoryId)?.name || ''}</p>
              <p><strong>{t('createListing:title')}:</strong> {title}</p>
              <p><strong>{t('createListing:price')}:</strong> {price}</p>
              <p><strong>{t('createListing:location')}:</strong> {loc}</p>
              {contactPhone && <p><strong>{t('createListing:contactPhone')}:</strong> {contactPhone}</p>}
              <p><strong>{t('createListing:negotiable')}:</strong> {negotiable? t('common:yes'): t('common:no')}</p>
              <p><strong>{t('createListing:description')}:</strong> {desc}</p>
              <div><strong>{t('createListing:specifications')}:</strong><ul>{Object.entries(specValues).map(([k,v])=> <li key={k}>{k}: {v}</li>)}</ul></div>
              {submitError && <div className="cl-error-box">{t('createListing:submitError')}: {JSON.stringify(submitError)}</div>}
              {fieldErrors._non && <div className="cl-error-box" role="alert">{fieldErrors._non}</div>}
            </div>
          )}
        </section>
      )}
      <div className="cl-nav-row">
        {step!=='category' && step!=='review' && <Button onClick={goPrev} variant="secondary">{t('createListing:back')}</Button>}
  {['category','core','specs'].includes(step) && <Button disabled={!canNext} onClick={handleAttemptNext}>{t('createListing:next')}</Button>}
        {step==='review' && !createdId && <Button onClick={onSubmit} disabled={submitting}>{submitting? t('common:loading'): t('createListing:submit')}</Button>}
      </div>
      <div className="cl-live-region" aria-live="polite" aria-atomic="true" style={{position:'absolute', left:'-9999px', height:'1px', width:'1px', overflow:'hidden'}}>{!canNext && firstErrorMessage}</div>
        </div>{/* end cl-main */}
      </div>{/* end cl-layout */}
    </div>
  );
}