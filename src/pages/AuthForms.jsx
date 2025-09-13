import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import './AuthPage.css';

const AuthPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className="auth-page">
      <div className="auth-container">
        {isLoginView ? (
          <>
            <LoginForm />
            <p className="toggle-view">
              Don't have an account?{' '}
              <span onClick={() => setIsLoginView(false)}>Sign Up</span>
            </p>
          </>
        ) : (
          <>
            <RegisterForm />
            <p className="toggle-view">
              Already have an account?{' '}
              <span onClick={() => setIsLoginView(true)}>Log In</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;