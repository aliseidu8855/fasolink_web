import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchSpecsMetadata, fetchLocationSuggestions } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { createListing, fetchCategories } from '../services/api';
import Button from '../components/Button';
import './CreateListingPage.css';

const PRIMARY_CATEGORIES = ['Phones','Cars','Real Estate','Electronics'];
// Temporary frontend hierarchy mapping (leaf names must match backend category names)
// Extend/adjust when real sub-category data is available.
const CATEGORY_HIERARCHY = {
  Phones: {
    children: {
      'Smartphones': { leaf: true, mapsTo: 'Phones' },
      'Accessories': { leaf: true, mapsTo: 'Phones' }
    }
  },
  Cars: {
    children: {
      'Sedans': { leaf: true, mapsTo: 'Cars' },
      'SUVs': { leaf: true, mapsTo: 'Cars' },
      'Trucks': { leaf: true, mapsTo: 'Cars' }
    }
  },
  'Real Estate': {
    children: {
      'Apartments': { leaf: true, mapsTo: 'Real Estate' },
      'Houses': { leaf: true, mapsTo: 'Real Estate' },
      'Land': { leaf: true, mapsTo: 'Real Estate' }
    }
  },
  Electronics: {
    children: {
      'Computers': { leaf: true, mapsTo: 'Electronics' },
      'TV & Video': { leaf: true, mapsTo: 'Electronics' },
      'Audio': { leaf: true, mapsTo: 'Electronics' }
    }
  }
};
const steps = ['category','core','specs','review'];

export default function CreateListingPage(){
  const { t } = useTranslation(['createListing','common']);
  const nav = useNavigate();
  const [allCats,setAllCats] = useState([]);
  const [catName,setCatName] = useState('');
  const [catPath,setCatPath] = useState([]); // navigation stack
  const [catFocusIndex,setCatFocusIndex] = useState(0); // keyboard focus within visible nodes
  const [step,setStep]=useState('category');
  const [title,setTitle]=useState('');
  const [price,setPrice]=useState('');
  const [negotiable,setNegotiable]=useState(false);
  const [desc,setDesc]=useState('');
  const [locQuery,setLocQuery]=useState('');
  const [loc,setLoc]=useState('');
  const [locSuggestions,setLocSuggestions]=useState([]);
  const [specMeta,setSpecMeta]=useState([]);
  const [specValues,setSpecValues]=useState({});
  const [images,setImages]=useState([]);
  const [submitting,setSubmitting]=useState(false);
  const [submitError,setSubmitError]=useState(null);
  const [createdId,setCreatedId]=useState(null);

  useEffect(()=>{ fetchCategories().then(r=> setAllCats(r.data)); },[]);
  useEffect(()=>{ if(catName){ fetchSpecsMetadata(catName).then(r=> setSpecMeta(r.data.specs||[])).catch(()=> setSpecMeta([])); } else setSpecMeta([]); },[catName]);
  useEffect(()=>{ if(locQuery.length>1){ fetchLocationSuggestions(locQuery).then(r=> setLocSuggestions(r.data.results||[])); } else setLocSuggestions([]); },[locQuery]);

  // primaryCats no longer directly used; hierarchy uses static mapping

  // Build visible node list depending on path
  const atRoot = catPath.length === 0;
  let visibleNodes = [];
  if(atRoot){
    visibleNodes = PRIMARY_CATEGORIES.map(name=> ({ label: name, expandable: !!CATEGORY_HIERARCHY[name], key: name }));
  } else {
    const top = catPath[catPath.length-1];
    const node = CATEGORY_HIERARCHY[top];
    if(node && node.children){
      visibleNodes = Object.entries(node.children).map(([label, cfg])=> ({ label, leaf: !!cfg.leaf, mapsTo: cfg.mapsTo || label, key: label }));
    }
  }

  const handleCategoryActivate = (node) => {
    if(atRoot){
      // Go deeper if expandable, else treat as leaf selection
      if(CATEGORY_HIERARCHY[node.key]){
        setCatPath(p=> [...p, node.key]);
        setCatFocusIndex(0);
      } else {
        setCatName(node.label);
      }
    } else {
      if(node.leaf){
        setCatName(node.mapsTo);
      } else {
        // Future deeper levels
        setCatPath(p=> [...p, node.key]);
        setCatFocusIndex(0);
      }
    }
  };

  const goBackCategory = () => {
    if(catPath.length===0) return; setCatPath(p=> p.slice(0,-1)); setCatName(''); setCatFocusIndex(0);
  };

  const onCatKeyDown = (e) => {
    if(!['ArrowRight','ArrowLeft','ArrowUp','ArrowDown','Home','End','Enter',' '].includes(e.key)) return;
    e.preventDefault();
    const max = visibleNodes.length -1;
    if(e.key==='ArrowRight' || e.key==='ArrowDown') setCatFocusIndex(i=> i>=max?0:i+1);
    else if(e.key==='ArrowLeft' || e.key==='ArrowUp') setCatFocusIndex(i=> i<=0?max:i-1);
    else if(e.key==='Home') setCatFocusIndex(0);
    else if(e.key==='End') setCatFocusIndex(max);
    else if(e.key==='Enter' || e.key===' '){
      const node = visibleNodes[catFocusIndex];
      if(node) handleCategoryActivate(node);
    }
  };
  const currentCatId = allCats.find(c=> c.name===catName)?.id;

  const requiredSpecsValid = specMeta.filter(s=> s.required).every(s=> (specValues[s.key]||'').toString().trim()!=='');
  const canNext = step==='category' ? !!catName : step==='core' ? (title.trim().length>4 && price && loc) : step==='specs' ? requiredSpecsValid : true;

  const goNext = () => { if(!canNext) return; setStep(p=> steps[steps.indexOf(p)+1]); };
  const goPrev = () => setStep(p=> steps[steps.indexOf(p)-1] || 'category');

  const onSubmit = async () => {
    setSubmitting(true); setSubmitError(null);
    try {
      const fd = new FormData();
      fd.append('title', title); fd.append('price', price); fd.append('description', desc); fd.append('location', loc); fd.append('category', currentCatId || ''); fd.append('negotiable', negotiable?'true':'false');
      const attrs = Object.keys(specValues).filter(k=> {
        const v = specValues[k];
        return v!=='' && v!=null;
      }).map(k=> ({ name:k, value: specValues[k] }));
      fd.append('attributes', JSON.stringify(attrs));
      images.forEach(img=> fd.append('uploaded_images', img));
      const res = await createListing(fd);
      setCreatedId(res.data.id);
      setStep('review');
    } catch(e){ setSubmitError(e.response?.data || 'Failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="container create-listing-page" role="main">
      <h1 className="cl-title">{t('createListing.postAd','Post a new listing')}</h1>
      <div className="cl-progress" aria-label={t('createListing.steps','Steps')}>
        {steps.map(s=> <span key={s} className={`cl-prog-step${steps.indexOf(s)<=steps.indexOf(step)?' active':''}`}>{t(`createListing.step_${s}`, s)}</span>)}
      </div>
      {step==='category' && (
        <section className="cl-panel" aria-labelledby="cl-cat-h">
          <div className="cl-cat-bar">
            {catPath.length>0 && <button type="button" className="cl-back-btn" onClick={goBackCategory}>{t('createListing.back','Back')}</button>}
            <h2 id="cl-cat-h" className="cl-cat-heading">{atRoot ? t('createListing.chooseCategory','Choose a category') : catPath[catPath.length-1]}</h2>
          </div>
          <ul className="cl-cat-grid" role="listbox" aria-activedescendant={`cat-node-${catFocusIndex}`} tabIndex={0} onKeyDown={onCatKeyDown}>
            {visibleNodes.map((node, idx)=> {
              const selected = catName && (node.mapsTo===catName || node.label===catName);
              const expandable = !node.leaf && (atRoot || !node.leaf);
              return (
                <li key={node.key} id={`cat-node-${idx}`}>
                  <button
                    type="button"
                    className={`cl-cat-btn${selected?' selected':''}`}
                    data-expandable={expandable||undefined}
                    onClick={()=> handleCategoryActivate(node)}
                    aria-selected={selected||undefined}
                    tabIndex={idx===catFocusIndex?0:-1}
                  >
                    <span className="cl-cat-label">{node.label}</span>
                    {expandable && <span className="cl-cat-chevron" aria-hidden>›</span>}
                  </button>
                </li>
              );
            })}
          </ul>
          {catName && <div className="cl-cat-selection-preview">{t('createListing.category','Category')}: <strong>{catName}</strong></div>}
        </section>
      )}
      {step==='core' && (
        <section className="cl-panel" aria-labelledby="cl-core-h">
          <h2 id="cl-core-h">{t('createListing.coreDetails','Core details')}</h2>
          <div className="cl-field"><label>{t('createListing.title','Title')}*</label><input value={title} onChange={e=> setTitle(e.target.value)} /></div>
          <div className="cl-field"><label>{t('createListing.price','Price')}*</label><input value={price} onChange={e=> setPrice(e.target.value.replace(/[^0-9.]/g,''))} /></div>
            <div className="cl-field"><label>{t('createListing.location','Location')}*</label>
              <input value={locQuery} onChange={e=> { setLocQuery(e.target.value); setLoc(e.target.value); }} aria-autocomplete="list" aria-expanded={locSuggestions.length>0} />
              {locSuggestions.length>0 && <ul className="cl-suggest" role="listbox">{locSuggestions.map(s=> <li key={s}><button type="button" onClick={()=>{ setLoc(s); setLocQuery(s); setLocSuggestions([]); }}>{s}</button></li>)}</ul>}
            </div>
          <div className="cl-field cl-check"><label><input type="checkbox" checked={negotiable} onChange={e=> setNegotiable(e.target.checked)} /> {t('createListing.negotiable','Negotiable')}</label></div>
          <div className="cl-field"><label>{t('createListing.description','Description')}</label><textarea rows={5} value={desc} onChange={e=> setDesc(e.target.value)} /></div>
          <div className="cl-field"><label>{t('createListing.images','Images')}</label><input type="file" multiple accept="image/*" onChange={e=> setImages(Array.from(e.target.files||[]))} /></div>
        </section>
      )}
      {step==='specs' && (
        <section className="cl-panel" aria-labelledby="cl-specs-h">
          <h2 id="cl-specs-h">{t('createListing.specifications','Specifications')}</h2>
          <div className="cl-spec-grid">
            {specMeta.map(m=> {
              const v = specValues[m.key] || ''; const invalid = m.required && !v;
              return <div key={m.key} className={`cl-spec-field${invalid?' invalid':''}`}>
                <label>{m.name}{m.required && ' *'}</label>
                <input value={v} onChange={e=> setSpecValues(o=> ({...o,[m.key]: e.target.value}))} aria-required={m.required||undefined} />
                {invalid && <span className="cl-err-msg">{t('createListing.required','Required')}</span>}
              </div>;
            })}
          </div>
        </section>
      )}
      {step==='review' && (
        <section className="cl-panel" aria-labelledby="cl-review-h">
          <h2 id="cl-review-h">{t('createListing.review','Review & submit')}</h2>
          {createdId ? (
            <div className="cl-success-box">
              <p>{t('createListing.success','Listing created successfully!')}</p>
              <Button onClick={()=> nav(`/listings/${createdId}`)}>{t('createListing.viewListing','View listing')}</Button>
            </div>
          ) : (
            <div className="cl-summary">
              <p><strong>{t('createListing.category','Category')}:</strong> {catName}</p>
              <p><strong>{t('createListing.title','Title')}:</strong> {title}</p>
              <p><strong>{t('createListing.price','Price')}:</strong> {price}</p>
              <p><strong>{t('createListing.location','Location')}:</strong> {loc}</p>
              <p><strong>{t('createListing.negotiable','Negotiable')}:</strong> {negotiable? t('common:yes','Yes'): t('common:no','No')}</p>
              <p><strong>{t('createListing.description','Description')}:</strong> {desc}</p>
              <div><strong>{t('createListing.specifications','Specifications')}:</strong><ul>{Object.entries(specValues).map(([k,v])=> <li key={k}>{k}: {v}</li>)}</ul></div>
              {submitError && <div className="cl-error-box">{t('createListing.submitError','Submit failed')}: {JSON.stringify(submitError)}</div>}
            </div>
          )}
        </section>
      )}
      <div className="cl-nav-row">
        {step!=='category' && step!=='review' && <Button onClick={goPrev} variant="secondary">{t('createListing.back','Back')}</Button>}
        {['category','core','specs'].includes(step) && <Button disabled={!canNext} onClick={goNext}>{t('createListing.next','Next')}</Button>}
        {step==='review' && !createdId && <Button onClick={onSubmit} disabled={submitting}>{submitting? t('common:loading','Loading...'): t('createListing.submit','Submit')}</Button>}
      </div>
    </div>
  );
}