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
        localStorage.setItem('edukids_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('edukids_v2_user');
        localStorage.removeItem('edukids_user');
        localStorage.removeItem('edukids_token');
      }
    } catch (e) {}
  }, [user]);

  // Auto-sync session across tabs and from cloud updates
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('edukids_v2_user') || localStorage.getItem('edukids_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          setUser(prev => {
            if (!prev || prev.xp !== parsed.xp || prev.class_code !== parsed.class_code || prev.full_name !== parsed.full_name) {
              return parsed;
            }
            return prev;
          });
        }
      } catch (e) {}
    };

    window.addEventListener('storage', handleSync);
    const interval = setInterval(handleSync, 4000);
    return () => {
      window.removeEventListener('storage', handleSync);
      clearInterval(interval);
    };
  }, []);

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
    try {
      localStorage.setItem('edukids_v2_user', JSON.stringify(updatedUser));
      let customSt = JSON.parse(localStorage.getItem('edukids_custom_students') || '[]');
      customSt = customSt.map(s => (s.full_name === user.full_name || String(s.id) === String(user.id) ? { ...s, ...updates } : s));
      localStorage.setItem('edukids_custom_students', JSON.stringify(customSt));
    } catch (e) {}

    // Async Cloud sync to Aiven MySQL
    api.request('/sync', {
      method: 'POST',
      body: JSON.stringify({ action: 'save_student', student: updatedUser })
    }).catch(() => {});
  };

  const addXp = (amount) => {
    if (!user) return;
    const newXp = (user.xp || 0) + amount;
    const updatedUser = {
      ...user,
      xp: newXp
    };
    setUser(updatedUser);

    try {
      localStorage.setItem('edukids_v2_user', JSON.stringify(updatedUser));
      let customSt = JSON.parse(localStorage.getItem('edukids_custom_students') || '[]');
      let found = false;
      customSt = customSt.map(s => {
        if (s.full_name === user.full_name || String(s.id) === String(user.id)) {
          found = true;
          return { ...s, xp: newXp };
        }
        return s;
      });
      if (!found && user.full_name) {
        customSt.push(updatedUser);
      }
      localStorage.setItem('edukids_custom_students', JSON.stringify(customSt));
    } catch (e) {}

    // Async Cloud sync updated student with new XP to Aiven MySQL
    api.request('/sync', {
      method: 'POST',
      body: JSON.stringify({ action: 'save_student', student: updatedUser })
    }).catch(() => {});
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
