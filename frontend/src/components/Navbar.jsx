import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { sound } from '../services/audio';

export default function Navbar({ activeTab, setActiveTab }) {
  const {
    user,
    logout,
    openLogin,
    openRegister,
    switchRole,
    getAvatarEmoji,
    isMuted,
    setIsMuted,
    setShowProfileModal
  } = useAuth();
  const { showInfo } = useToast();

  const handleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const getGradeName = (num) => {
    const map = { 1: 'Lớp 1 🌱', 2: 'Lớp 2 🐥', 3: 'Lớp 3 🐱', 4: 'Lớp 4 🚀', 5: 'Lớp 5 👑' };
    return map[num] || `Lớp ${num}`;
  };

  const handleLogout = () => {
    sound.pop();
    logout();
    showInfo('Đã đăng xuất', 'Hẹn gặp lại bạn trong buổi học tiếp theo! 👋');
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
          {user && user.role === 'student' && (
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

          {user && user.role === 'teacher' && (
            <button
              className="nav-btn active"
              onClick={() => { sound.pop(); setActiveTab('teacher'); }}
            >
              👩‍🏫 Quản Lý Lớp Học & Bài Tập
            </button>
          )}

          {user && user.role === 'admin' && (
            <button
              className="nav-btn active"
              onClick={() => { sound.pop(); setActiveTab('admin'); }}
            >
              👨‍💼 Quản Trị Hệ Thống
            </button>
          )}
        </div>

        {/* Gamification Stats & Profile / Login Buttons */}
        <div className="nav-stats">
          {user ? (
            <>
              {user.role === 'student' && (
                <>
                  {/* Grade Badge */}
                  <div
                    className="chip"
                    onClick={() => { sound.pop(); setShowProfileModal(true); }}
                    style={{
                      background: '#EEF2FF',
                      color: 'var(--primary)',
                      border: '1.5px solid #C7D2FE',
                      cursor: 'pointer'
                    }}
                    title="Bấm để đổi khối lớp nếu bé vừa lên lớp mới"
                  >
                    <span>🏫</span>
                    <span>{getGradeName(user.grade_level || 1)}</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>✏️</span>
                  </div>

                  {/* XP */}
                  <div className="chip chip-xp" title="Điểm kinh nghiệm XP">
                    <span>⭐</span>
                    <span>{user.xp || 0} XP</span>
                  </div>

                  {/* Streak */}
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

              {/* User Profile Badge -> Opens Profile Modal */}
              <div
                className="user-badge"
                onClick={() => { sound.pop(); setShowProfileModal(true); }}
                title="Bấm để xem hồ sơ và đổi khối lớp"
              >
                <span style={{ fontSize: '1.4rem' }}>{getAvatarEmoji(user.avatar)}</span>
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{user.full_name}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800 }}>
                    [{user.role.toUpperCase()}]
                  </span>
                </div>
              </div>

              {/* Quick Role Switcher */}
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

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="btn-secondary"
                style={{
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: '#DC2626',
                  background: '#FEE2E2',
                  border: '1px solid #FECDD3',
                  cursor: 'pointer'
                }}
                title="Đăng xuất tài khoản"
              >
                <span>🚪 Đăng Xuất</span>
              </button>
            </>
          ) : (
            /* Logged Out State */
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn-secondary"
                onClick={() => { sound.pop(); openLogin(); }}
                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
              >
                <span>🔑 Đăng Nhập</span>
              </button>
              <button
                className="btn-primary"
                onClick={() => { sound.pop(); openRegister(); }}
                style={{ padding: '8px 18px', fontSize: '0.9rem' }}
              >
                <span>⭐ Đăng Ký Mới</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
