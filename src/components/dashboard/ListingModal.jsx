import React, { useState, useEffect } from 'react';
import { createListing, updateListing } from '../../services/api';
import './listingModal.css';
import { useTranslation } from 'react-i18next';

// Simple form fields subset; can expand with category, location, negotiable later
const DEFAULT_FORM = {
  title: '',
  price: '',
  description: ''
};

const ListingModal = ({ open, onClose, existing, onCreated, onUpdated }) => {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!existing;
  const [error, setError] = useState(null);
  const { t } = useTranslation('dashboard');

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title || '',
        price: existing.price || '',
        description: existing.description || ''
      });
    } else if (open) {
      setForm(DEFAULT_FORM);
    }
  }, [existing, open]);

  if (!open) return null;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = new FormData();
      payload.append('title', form.title);
      payload.append('price', form.price);
      payload.append('description', form.description);
      let res;
      if (isEdit) {
        res = await updateListing(existing.id, payload);
        onUpdated?.(res.data);
      } else {
        res = await createListing(payload);
        onCreated?.(res.data);
      }
      onClose();
    } catch (err) {
      console.error(err);
  setError(err.response?.data?.detail || t('modal.saveError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="listing-modal-backdrop" role="dialog" aria-modal="true">
      <div className="listing-modal">
        <header className="lm-header">
          <h2 className="lm-title">{isEdit ? t('modal.editTitle') : t('modal.newTitle')}</h2>
          <button className="lm-close" onClick={onClose} aria-label={t('modal.cancel')}>×</button>
        </header>
        <form onSubmit={handleSubmit} className="lm-form">
          <label>
            <span>{t('modal.fields.title')}</span>
            <input name="title" value={form.title} onChange={handleChange} required maxLength={120} />
          </label>
          <label>
            <span>{t('modal.fields.price')}</span>
            <input name="price" type="number" inputMode="numeric" value={form.price} onChange={handleChange} required />
          </label>
          <label>
            <span>{t('modal.fields.description')}</span>
            <textarea name="description" rows={4} value={form.description} onChange={handleChange} />
          </label>
          {error && <p className="lm-error" role="alert">{error}</p>}
          <div className="lm-actions">
            <button type="button" className="btn ghost" onClick={onClose}>{t('modal.cancel')}</button>
            <button type="submit" className="btn" disabled={submitting}>{submitting ? t('modal.saving') : (isEdit ? t('modal.update') : t('modal.create'))}</button>
          </div>
        </form>
        <p className="lm-hint">{t('modal.hint')}</p>
      </div>
    </div>
  );
};

export default ListingModal;
