import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const mascotMap = {
  'mascot-bear': '🐻',
  'mascot-lion': '🦁',
  'mascot-rabbit': '🐰',
  'mascot-fox': '🦊',
  'mascot-panda': '🐼'
};

// Automatically wipe legacy mock session on load
try {
  if (localStorage.getItem('edukids_user')) {
    localStorage.removeItem('edukids_user');
    localStorage.removeItem('edukids_token');
  }
} catch (e) {
  // Ignore localStorage errors
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('edukids_v2_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isMuted, setIsMuted] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' or 'register'

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('edukids_v2_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('edukids_v2_user');
        localStorage.removeItem('edukids_user');
        localStorage.removeItem('edukids_token');
      }
    } catch (e) {}
  }, [user]);

  const login = async (username, password) => {
    const res = await api.login(username, password);
    if (res.success && res.user) {
      api.setToken(res.token);
      setUser(res.user);
      setShowAuthModal(false);
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'Sai tên đăng nhập hoặc mật khẩu!' };
  };

  const register = async (payload) => {
    const res = await api.register(payload);
    if (res.success && res.user) {
      api.setToken(res.token);
      setUser(res.user);
      setShowAuthModal(false);
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'Đăng ký thất bại!' };
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('edukids_v2_user');
      localStorage.removeItem('edukids_user');
      localStorage.removeItem('edukids_token');
    } catch (e) {}
    api.setToken(null);
  };

  const switchRole = async (targetRole) => {
    const res = await api.switchDemo(targetRole);
    if (res.success && res.user) {
      api.setToken(res.token);
      setUser(res.user);
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('edukids_user', JSON.stringify(updatedUser));
    await api.request('/students/settings', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  };

  const addXp = (amount) => {
    if (!user) return;
    const newXp = (user.xp || 0) + amount;
    setUser(prev => ({
      ...prev,
      xp: newXp
    }));
  };

  const openLogin = () => {
    setAuthModalMode('login');
    setShowAuthModal(true);
  };

  const openRegister = () => {
    setAuthModalMode('register');
    setShowAuthModal(true);
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      login,
      register,
      logout,
      switchRole,
      updateProfile,
      addXp,
      isMuted,
      setIsMuted,
      showProfileModal,
      setShowProfileModal,
      showAuthModal,
      setShowAuthModal,
      authModalMode,
      setAuthModalMode,
      openLogin,
      openRegister,
      getAvatarEmoji: (key) => mascotMap[key] || '🐻'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
