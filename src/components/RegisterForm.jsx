import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(''); // Optional email field
  const [error, setError] = useState('');
  const { register, authError, clearError, consumeIntendedPath } = useAuth();
  const { t } = useTranslation(['auth']);
  const navigate = useNavigate();

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const usernameRef = useRef(null);

  useEffect(()=>{ usernameRef.current?.focus(); },[]);
  useEffect(()=>{ if(authError) setError(t(authError)); },[authError,t]);

  const passwordStrength = password.length === 0 ? '' : password.length < 6 ? t('auth:weak','Weak') : password.length < 10 ? t('auth:fair','Fair') : t('auth:strong','Strong');

  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Basic validation (e.g., password length) can be added here
    if (password.length < 6) {
      setError(t('auth:passwordTooShort','Password must be at least 6 characters long.'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth:passwordMismatch','Passwords do not match.'));
      return;
    }

    try {
      setSubmitting(true);
      await register({ username, password });
      const intended = consumeIntendedPath();
      navigate(intended || '/');
      setSuccess(true);
    } catch {
      if(!authError) setError(t('auth:registerFailed','Failed to register. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
  <div className="auth-panel">
  <form onSubmit={handleSubmit} className="form scroll-area" noValidate aria-labelledby="register-title" aria-describedby="register-desc">
      <h2 id="register-title" style={{marginTop:0}}>{t('auth:register')}</h2>
      <p id="register-desc" className="visually-hidden">{t('auth:register')} {t('auth:username')}, {t('auth:email','Email')}, {t('auth:password')} {t('auth:confirmPassword')}.</p>
      <div className="form-status" aria-live="polite">
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{t('auth:loggedInAs', { username })}</p>}
      </div>
      <div className="field-group">
        <label className="field-label" htmlFor="reg-username">{t('auth:username')}</label>
        <input
          id="reg-username"
          ref={usernameRef}
          className="input-control"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => { setUsername(e.target.value); clearError(); }}
          required
        />
      </div>
      <div className="field-group">
        <label className="field-label" htmlFor="reg-email">{t('auth:email','Email Address')}</label>
        <input
          id="reg-email"
          className="input-control"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="field-group">
        <label className="field-label" htmlFor="reg-password">{t('auth:password')}</label>
        <div className="password-wrapper">
          <input
            id="reg-password"
            className="input-control"
            type={showPwd ? 'text':'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError(); }}
            required
          />
          <button type="button" className="show-hide" onClick={()=>setShowPwd(s=>!s)} aria-label={showPwd ? t('auth:hidePassword','Hide password') : t('auth:showPassword','Show password')}>
            {showPwd ? t('auth:hide','Hide') : t('auth:show','Show')}
          </button>
        </div>
        {passwordStrength && <div className={`pwd-strength strength-${passwordStrength.toLowerCase()}`}>{passwordStrength}</div>}
      </div>
      <div className="field-group">
        <label className="field-label" htmlFor="reg-confirm">{t('auth:confirmPassword')}</label>
        <div className="password-wrapper">
          <input
            id="reg-confirm"
            className="input-control"
            type={showConfirm ? 'text':'password'}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); clearError(); }}
            required
          />
          <button type="button" className="show-hide" onClick={()=>setShowConfirm(s=>!s)} aria-label={showConfirm ? t('auth:hidePassword','Hide password') : t('auth:showPassword','Show password')}>
            {showConfirm ? t('auth:hide','Hide') : t('auth:show','Show')}
          </button>
        </div>
      </div>
      <button type="submit" className="btn btn-auth-primary" disabled={submitting}>
        {submitting ? t('common:loading','Loading...') : t('auth:register')}
      </button>
    </form>
    </div>
  );
};

export default RegisterForm;