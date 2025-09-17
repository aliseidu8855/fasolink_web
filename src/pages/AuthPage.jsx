import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LoginForm from '../components/LoginForm'
import RegisterForm from '../components/RegisterForm'
import { useAuth } from '../context/AuthContext'
import '../styles/forms.css'
import './AuthPage.css'

export default function AuthPage() {
  const { isAuthenticated, consumeIntendedPath } = useAuth()
  const [params, setParams] = useSearchParams()
  const modeParam = params.get('mode')
  const initialMode = modeParam === 'register' ? 'register' : 'login'
  const [mode, setMode] = useState(initialMode)
  const { t } = useTranslation(['auth'])
  const navigate = useNavigate()

  // Helper: basic safety check to prevent external redirects via `next`
  const isSafeNext = (p) => {
    if (!p || typeof p !== 'string') return false
    // same-origin path only
    if (!p.startsWith('/')) return false
    // Avoid protocol-relative or suspicious sequences
    if (p.startsWith('//')) return false
    return true
  }

  useEffect(() => {
    if (isAuthenticated) {
      const nextParam = params.get('next')
      const safe = isSafeNext(nextParam) ? nextParam : null
      const back = safe || consumeIntendedPath() || '/'
      navigate(back, { replace: true })
    }
  }, [isAuthenticated, navigate, consumeIntendedPath, params])

  const switchMode = (next) => {
    setMode(next)
    params.set('mode', next)
    setParams(params, { replace:true })
  }

  // Detect if user came from a listing with intent to message seller
  const nextParam = params.get('next') || ''
  const cameToMessageSeller = typeof nextParam === 'string' && nextParam.includes('#message-seller')

  // Lazy load provider handlers (placeholder logic)
  const [loadingProvider, setLoadingProvider] = useState(null);
  const handleProvider = async (provider) => {
    try {
      setLoadingProvider(provider);
      if (provider === 'google') {
        const mod = await import(/* webpackChunkName: "auth-google" */ '../services/auth/googleStub.js');
        await mod.startGoogle();
      } else if (provider === 'facebook') {
        const mod = await import(/* webpackChunkName: "auth-facebook" */ '../services/auth/facebookStub.js');
        await mod.startFacebook();
      }
    } catch (e) {
      console.warn('Provider auth failed (stub)', e);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-shell" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <div className="sheet-handle" aria-hidden="true"><span /></div>
        <h1 id="auth-title" className="auth-title">{mode === 'login' ? t('auth:login') : t('auth:register')}</h1>
        <div className="social-row">
          <button
            className="social-btn google"
            aria-label={t('auth:continueGoogle','Continue with Google')}
            disabled={loadingProvider==='google'}
            onClick={()=>handleProvider('google')}
          >
            <span className="ico">G</span> {loadingProvider==='google' ? t('auth:loading','...') : 'Google'}
          </button>
          <button
            className="social-btn facebook"
            aria-label={t('auth:continueFacebook','Continue with Facebook')}
            disabled={loadingProvider==='facebook'}
            onClick={()=>handleProvider('facebook')}
          >
            <span className="ico">f</span> {loadingProvider==='facebook' ? t('auth:loading','...') : 'Facebook'}
          </button>
        </div>
        {cameToMessageSeller && (
          <div className="auth-hint" role="note">
            {t('auth:continueToMessage','Continue to message the seller after you finish signing in.')}
          </div>
        )}
        <div className="separator"><span>{t('auth:or','or')}</span></div>
        {mode === 'login' ? <LoginForm /> : <RegisterForm />}
        <p className="switch-line">
          {mode === 'login' ? (
            <>
              {t('auth:noAccount','No account yet?')}{' '}
              <button className="linkish" onClick={() => switchMode('register')}>{t('auth:register')}</button>
            </>
          ) : (
            <>
              {t('auth:haveAccount','Already have an account?')}{' '}
              <button className="linkish" onClick={() => switchMode('login')}>{t('auth:login')}</button>
            </>
          )}
        </p>
        <p className="terms-line">{t('auth:byContinuing','By continuing you agree to the')} <a href="/policy" className="policy-link">{t('auth:policyAndRules','Policy and Rules')}</a></p>
      </div>
    </div>
  )
}
