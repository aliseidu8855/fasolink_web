import React, { useState } from 'react';
import { updateProfile } from '../../services/api';
import { useTranslation } from 'react-i18next';

const DashboardProfilePanel = ({ user, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });

  const toggle = () => setEditing(e => !e);
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const resp = await updateProfile({ username: form.username, email: form.email });
      onUpdate?.(resp.data);
      setEditing(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Erreur de sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const { t } = useTranslation('dashboard');
  return (
    <div className="dash-panel">
      <header className="dash-panel-header row">
        <h2 className="dash-panel-title">{t('profile.title')}</h2>
        <div>
          <button className="text-btn" onClick={toggle}>{editing ? t('profile.cancel') : t('profile.edit')}</button>
        </div>
      </header>
      {!editing && (
        <div className="profile-summary">
          <p><strong>{t('profile.username')}:</strong> {user?.username}</p>
          <p><strong>{t('profile.email')}:</strong> {user?.email}</p>
        </div>
      )}
      {editing && (
        <form onSubmit={handleSubmit} className="profile-form">
          <label>
            <span>{t('profile.username')}</span>
            <input name="username" value={form.username} onChange={handleChange} />
          </label>
          <label>
            <span>{t('profile.email')}</span>
            <input name="email" value={form.email} onChange={handleChange} />
          </label>
          {error && <p className="lm-error" role="alert" style={{color:'#b00020', fontSize:'.75rem'}}>{t('profile.saveError')}</p>}
          <div className="form-row">
            <button className="btn" disabled={saving}>{saving ? t('profile.saving') : t('profile.save')}</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DashboardProfilePanel;
