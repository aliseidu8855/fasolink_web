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

  useEffect(() => { if (isAuthenticated) { const back = consumeIntendedPath() || '/'; navigate(back, { replace:true }) } }, [isAuthenticated, navigate, consumeIntendedPath])

  const switchMode = (next) => {
    setMode(next)
    params.set('mode', next)
    setParams(params, { replace:true })
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-shell" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <h1 id="auth-title" className="auth-title">{mode === 'login' ? t('auth:login') : t('auth:register')}</h1>
        <div className="social-row">
          <button className="social-btn google" aria-label={t('auth:continueGoogle','Continue with Google')}>
            <span className="ico">G</span> Google
          </button>
          <button className="social-btn facebook" aria-label={t('auth:continueFacebook','Continue with Facebook')}>
            <span className="ico">f</span> Facebook
          </button>
        </div>
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
