import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import './AuthForms.css';

const AuthForms = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const { t } = useTranslation(['auth']);

  return (
    <div className="auth-forms">
      <div className="auth-container">
        {isLoginView ? (
          <>
            <LoginForm />
            <p className="toggle-view">
              {t('auth:noAccount','Don\'t have an account?')}{' '}
              <span onClick={() => setIsLoginView(false)}>{t('auth:register')}</span>
            </p>
          </>
        ) : (
          <>
            <RegisterForm />
            <p className="toggle-view">
              {t('auth:haveAccount','Already have an account?')}{' '}
              <span onClick={() => setIsLoginView(true)}>{t('auth:login')}</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthForms;