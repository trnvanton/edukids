import React from 'react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../services/audio';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, switchRole, getAvatarEmoji, isMuted, setIsMuted } = useAuth();

  const handleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="main-navbar">
      <div className="container nav-content">
        {/* Logo */}
        <div className="nav-logo" onClick={() => setActiveTab('dashboard')}>
          <div className="nav-logo-icon">🎒</div>
          <div className="nav-logo-text">
            <h1>EduKids</h1>
            <p>Học Tập & Luyện Tập Thông Minh</p>
          </div>
        </div>

        {/* Navigation Tabs based on Role */}
        <div className="nav-links">
          {user.role === 'student' && (
            <>
              <button
                className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => { sound.pop(); setActiveTab('dashboard'); }}
              >
                🏠 Trang Chủ
              </button>
              <button
                className={`nav-btn ${activeTab === 'subjects' ? 'active' : ''}`}
                onClick={() => { sound.pop(); setActiveTab('subjects'); }}
              >
                📚 Môn Học & Bài Tập
              </button>
              <button
                className={`nav-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
                onClick={() => { sound.pop(); setActiveTab('leaderboard'); }}
              >
                🏆 Bảng Vàng
              </button>
            </>
          )}

          {user.role === 'teacher' && (
            <button
              className="nav-btn active"
              onClick={() => { sound.pop(); setActiveTab('teacher'); }}
            >
              👩‍🏫 Quản Lý Lớp Học & Bài Tập
            </button>
          )}

          {user.role === 'admin' && (
            <button
              className="nav-btn active"
              onClick={() => { sound.pop(); setActiveTab('admin'); }}
            >
              👨‍💼 Quản Trị Hệ Thống
            </button>
          )}
        </div>

        {/* Gamification Stats & Profile */}
        <div className="nav-stats">
          {user.role === 'student' && (
            <>
              <div className="chip chip-xp" title="Điểm kinh nghiệm XP">
                <span>⭐</span>
                <span>{user.xp || 0} XP</span>
              </div>
              <div className="chip chip-streak" title="Chuỗi ngày học liên tục">
                <span>🔥</span>
                <span>{user.streak_days || 1} ngày</span>
              </div>
            </>
          )}

          {/* Sound Toggle */}
          <button
            onClick={handleSound}
            className="nav-btn"
            style={{ padding: '8px 12px' }}
            title="Bật/Tắt âm thanh"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          {/* Quick Role Switcher Dropdown / Badge */}
          <div className="user-badge" title="Đổi tài khoản Demo (Học sinh / Giáo viên / Admin)">
            <span style={{ fontSize: '1.4rem' }}>{getAvatarEmoji(user.avatar)}</span>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{user.full_name}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800 }}>
                [{user.role.toUpperCase()}]
              </span>
            </div>
          </div>

          {/* Switch Role Fast Buttons for testing */}
          <select
            value={user.role}
            onChange={(e) => { sound.pop(); switchRole(e.target.value); }}
            style={{
              padding: '6px 10px',
              borderRadius: '9999px',
              border: '2px solid #C7D2FE',
              background: '#EEF2FF',
              fontWeight: 800,
              fontSize: '0.8rem',
              color: 'var(--primary)',
              cursor: 'pointer'
            }}
          >
            <option value="student">👦 Học Sinh</option>
            <option value="teacher">👩‍🏫 Giáo Viên</option>
            <option value="admin">👨‍💼 Admin</option>
          </select>
        </div>
      </div>
    </header>
  );
}
