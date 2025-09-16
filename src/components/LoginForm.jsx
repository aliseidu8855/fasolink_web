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
  <div className="auth-panel">
  <form onSubmit={handleSubmit} className="form scroll-area" noValidate aria-labelledby="login-title" aria-describedby="login-desc">
      <h2 id="login-title" style={{marginTop:0}}>{t('auth:login')}</h2>
      <p id="login-desc" className="visually-hidden">{t('auth:login')} {t('auth:username')} & {t('auth:password')} {t('auth:required','required')}</p>
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
      <button type="submit" className="btn btn-auth-primary" disabled={submitting} style={{marginTop:'0.25rem'}}>
        {submitting ? t('common:loading','Loading...') : t('auth:login')}
      </button>
      <div className="auth-divider" aria-hidden="true"></div>
      <div className="auth-alt-actions">
        <button type="button" className="auth-link-btn" data-auth-switch="register">{t('auth:noAccount','No account yet? Create one')}</button>
      </div>
    </form>
    </div>
  );
};

export default LoginForm;