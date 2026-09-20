import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('internconnect_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        setUser(res.user);
        setProfile(res.profile);
      } catch (err) {
        console.error('Failed to load user session:', err);
        localStorage.removeItem('internconnect_token');
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    localStorage.setItem('internconnect_token', res.token);
    setUser(res.user);
    setProfile(res.profile);
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    localStorage.setItem('internconnect_token', res.token);
    setUser(res.user);
    setProfile(res.profile);
    return res;
  };

  // 1-Click Demo Login Switcher (Ethiopian Context)
  const demoLogin = async (role) => {
    let credentials = { email: 'muniratbrk@act.edu.et', password: 'password123' };
    if (role === 'company') {
      credentials = { email: 'careers@cbe.com.et', password: 'password123' };
    } else if (role === 'admin') {
      credentials = { email: 'admin@internconnect.et', password: 'password123' };
    }
    try {
      return await login(credentials.email, credentials.password);
    } catch (err) {
      if (role === 'student') {
        return await login('yohannes.t@aait.edu.et', 'password123');
      }
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('internconnect_token');
    setUser(null);
    setProfile(null);
  };

  const updateProfileState = (newProfile) => {
    setProfile(newProfile);
  };

  const verifyEmail = async () => {
    await api.verifyEmail();
    setUser((prev) => (prev ? { ...prev, is_verified: true } : prev));
  };

  const value = {
    user,
    profile,
    loading,
    role: user?.role || null,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isCompany: user?.role === 'company',
    isAdmin: user?.role === 'admin',
    login,
    register,
    demoLogin,
    logout,
    updateProfileState,
    verifyEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
