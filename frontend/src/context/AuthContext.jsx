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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('edukids_user');
    return saved ? JSON.parse(saved) : {
      id: 1,
      username: 'student1',
      full_name: 'Nguyễn Minh Anh',
      role: 'student',
      grade_level: 4,
      avatar: 'mascot-bear',
      xp: 1250,
      level: 5,
      streak_days: 7,
      levelInfo: { level: 5, title: 'Siêu Học Sinh', icon: '👑', progress: 100 }
    };
  });

  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('edukids_user', JSON.stringify(user));
    }
  }, [user]);

  const switchRole = async (targetRole) => {
    const res = await api.switchDemo(targetRole);
    if (res.success && res.user) {
      api.setToken(res.token);
      setUser(res.user);
    }
  };

  const login = async (username, password) => {
    const res = await api.login(username, password);
    if (res.success && res.user) {
      api.setToken(res.token);
      setUser(res.user);
      return { success: true };
    }
    return { success: false, message: res.message };
  };

  const addXp = (amount) => {
    if (!user) return;
    const newXp = (user.xp || 0) + amount;
    setUser(prev => ({
      ...prev,
      xp: newXp
    }));
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      login,
      switchRole,
      addXp,
      isMuted,
      setIsMuted,
      getAvatarEmoji: (key) => mascotMap[key] || '🐻'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
