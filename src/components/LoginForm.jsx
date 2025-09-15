import React, { useState, useEffect, useRef } from 'react'; 
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, authError, clearError, consumeIntendedPath } = useAuth();
  const { t } = useTranslation(['auth','common']);
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const usernameRef = useRef(null);

  useEffect(()=>{ usernameRef.current?.focus(); },[]);

  useEffect(()=>{ if(authError) setError(t(authError)); },[authError,t]);

  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      setSubmitting(true);
      await login({ username, password });
      const intended = consumeIntendedPath();
      navigate(intended || '/');
      setSuccess(true);
  } catch {
      // error already captured in context
      if(!authError) setError(t('auth:loginFailed','Failed to log in. Please check your credentials.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form" noValidate>
      <h2>{t('auth:login')}</h2>
      <div className="form-status" aria-live="polite">
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{t('auth:loggedInAs', { username })}</p>}
      </div>
      <div className="field-group">
        <label className="field-label" htmlFor="login-username">{t('auth:username')}</label>
        <input id="login-username" ref={usernameRef} className="input-control" type="text" autoComplete="username" value={username} onChange={(e) => { setUsername(e.target.value); clearError(); }} required />
      </div>
      <div className="field-group">
        <label className="field-label" htmlFor="login-password">{t('auth:password')}</label>
        <div className="password-wrapper">
          <input id="login-password" className="input-control" type={showPwd ? 'text':'password'} autoComplete="current-password" value={password} onChange={(e) => { setPassword(e.target.value); clearError(); }} required />
          <button type="button" className="show-hide" onClick={()=>setShowPwd(s=>!s)} aria-label={showPwd ? t('auth:hidePassword','Hide password') : t('auth:showPassword','Show password')}>
            {showPwd ? t('auth:hide','Hide') : t('auth:show','Show')}
          </button>
        </div>
      </div>
      <Button type="submit" variant="primary" disabled={submitting}>{submitting ? t('common:loading','Loading...') : t('auth:login')}</Button>
    </form>
  );
};

export default LoginForm;