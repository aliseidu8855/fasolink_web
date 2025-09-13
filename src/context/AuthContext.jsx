import React, { createContext, useState, useContext } from 'react';
import { loginUser as loginApi, registerUser as registerApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  const login = async (credentials) => {
    const response = await loginApi(credentials);
    const { token } = response.data;
    setToken(token);
    // For now, we'll just store the username. We can fetch full user profile later.
    setUser({ username: credentials.username }); 
    localStorage.setItem('authToken', token);
  };

  const register = async (userData) => {
    await registerApi(userData);
    // After successful registration, log the user in automatically
    await login({ username: userData.username, password: userData.password });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
  };

  const authValue = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
};

// Custom hook to easily access the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};