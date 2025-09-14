import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { loginUser as loginApi, registerUser as registerApi, fetchCurrentUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [initializing, setInitializing] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [intendedPath, setIntendedPath] = useState(null);

  // Restore user profile if token exists
  useEffect(() => {
    const init = async () => {
      if (!token) { setInitializing(false); return; }
      try {
        const me = await fetchCurrentUser();
        setUser({ username: me.data.username, id: me.data.id });
  } catch {
        // Token may be invalid; clear it
        localStorage.removeItem('authToken');
        setToken(null);
      } finally {
        setInitializing(false);
      }
    };
    init();
  }, [token]);

  const clearError = () => setAuthError(null);

  const login = async (credentials) => {
    clearError();
    try {
      const response = await loginApi(credentials);
      const { token: newToken } = response.data;
      setToken(newToken);
      localStorage.setItem('authToken', newToken);
      // fetch profile after login to ensure canonical data
      const me = await fetchCurrentUser();
      setUser({ username: me.data.username, id: me.data.id });
      return { ok: true };
    } catch (e) {
      setAuthError(e.response?.data?.detail || 'auth.genericError');
      throw e;
    }
  };

  const register = async (userData) => {
    clearError();
    try {
      await registerApi(userData);
      await login({ username: userData.username, password: userData.password });
      return { ok: true };
    } catch (e) {
      setAuthError(e.response?.data?.username?.[0] || 'auth.registerFailed');
      throw e;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
  };

  const captureIntendedPath = useCallback((path) => {
    setIntendedPath(path);
  }, []);

  const consumeIntendedPath = useCallback(() => {
    const p = intendedPath;
    setIntendedPath(null);
    return p;
  }, [intendedPath]);

  const authValue = {
    user,
    token,
    login,
    register,
    logout,
    initializing,
    authError,
    clearError,
    intendedPath,
    captureIntendedPath,
    consumeIntendedPath,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
};

// Custom hook to easily access the auth context
// Hook export retained; file also exports provider (acceptable for our structure)
export const useAuth = () => {
  return useContext(AuthContext);
};