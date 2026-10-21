/**
 * HackBridge Authentication & Global Toast Context
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('hackbridge_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Global toast helper
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const refreshUser = async () => {
    try {
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const res = await api.auth.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        logout();
      }
    } catch (e) {
      console.warn('Failed to refresh user:', e.message);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('hackbridge_token', res.token);
      setToken(res.token);
      setUser(res.user);
      addToast(`Welcome back, ${res.user.name}!`, 'success');
      return res.user;
    }
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('hackbridge_token', res.token);
      setToken(res.token);
      setUser(res.user);
      addToast('Registration complete! Welcome to HackBridge.', 'success');
      return res.user;
    }
  };

  const demoLogin = async (role = 'student') => {
    try {
      const res = await api.auth.demoLogin(role);
      if (res.success && res.token) {
        localStorage.setItem('hackbridge_token', res.token);
        setToken(res.token);
        setUser(res.user);
        addToast(`Signed in as Demo ${role.toUpperCase()} (${res.user.name})`, 'success');
        return res.user;
      }
    } catch (err) {
      addToast(err.message || 'Demo login failed', 'danger');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('hackbridge_token');
    setToken(null);
    setUser(null);
    addToast('You have been signed out.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
        refreshUser,
        addToast,
        removeToast,
        toasts,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
