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

  const handleLogout = () => {
    sound.pop();
    logout();
    showInfo('Đã đăng xuất', 'Hẹn gặp lại bạn trong buổi học tiếp theo! 👋');
  };

  return (
    <header style={{
      background: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '68px',
        padding: '0 20px'
      }}>
        {/* Left: Brand Logo */}
        <div
          onClick={() => { sound.pop(); setActiveTab('dashboard'); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            fontSize: '1.6rem',
            background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #C7D2FE'
          }}>
            🎒
          </div>
          <div>
            <span style={{
              fontSize: '1.3rem',
              fontWeight: 900,
              color: '#4F46E5',
              letterSpacing: '-0.3px',
              display: 'block',
              lineHeight: 1.1
            }}>
              EduKids
            </span>
            <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700 }}>
              Tiểu Học Thông Minh
            </span>
          </div>
        </div>

        {/* Center: Clean Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {user && user.role === 'student' && (
            <>
              <button
                onClick={() => { sound.pop(); setActiveTab('dashboard'); }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  background: activeTab === 'dashboard' ? '#EEF2FF' : 'transparent',
                  color: activeTab === 'dashboard' ? '#4F46E5' : '#64748B',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🏠</span>
                <span>Trang Chủ</span>
              </button>

              <button
                onClick={() => { sound.pop(); setActiveTab('subjects'); }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  background: activeTab === 'subjects' ? '#EEF2FF' : 'transparent',
                  color: activeTab === 'subjects' ? '#4F46E5' : '#64748B',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>📚</span>
                <span>Môn Học & Bài Tập</span>
              </button>

              <button
                onClick={() => { sound.pop(); setActiveTab('leaderboard'); }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  background: activeTab === 'leaderboard' ? '#EEF2FF' : 'transparent',
                  color: activeTab === 'leaderboard' ? '#4F46E5' : '#64748B',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🏆</span>
                <span>Bảng Vàng</span>
              </button>
            </>
          )}

          {user && user.role === 'teacher' && (
            <button
              onClick={() => { sound.pop(); setActiveTab('teacher'); }}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                background: '#FEF3C7',
                color: '#B45309'
              }}
            >
              👩‍🏫 Quản Lý Lớp Học & Bài Tập
            </button>
          )}

          {user && user.role === 'admin' && (
            <button
              onClick={() => { sound.pop(); setActiveTab('admin'); }}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                background: '#ECFDF5',
                color: '#065F46'
              }}
            >
              👨‍💼 Quản Trị Hệ Thống
            </button>
          )}
        </nav>

        {/* Right: Consolidated Student Badge & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <>
              {/* Consolidated Student Status Pill */}
              {user.role === 'student' && (
                <div
                  onClick={() => { sound.pop(); setShowProfileModal(true); }}
                  title="Bấm để đổi khối lớp hoặc avatar"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ color: '#4F46E5', background: '#EEF2FF', padding: '2px 8px', borderRadius: '9999px' }}>
                    🏫 Lớp {user.grade_level || 2}
                  </span>
                  <span style={{ color: '#D97706' }}>
                    ⭐ {user.xp || 0} XP
                  </span>
                  <span style={{ color: '#EF4444' }}>
                    🔥 {user.streak_days || 1}d
                  </span>
                </div>
              )}

              {/* Sound Toggle Button */}
              <button
                onClick={handleSound}
                title="Bật/Tắt âm thanh"
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>

              {/* User Avatar & Name */}
              <div
                onClick={() => { sound.pop(); setShowProfileModal(true); }}
                title="Hồ sơ của bé"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '8px'
                }}
              >
                <span style={{ fontSize: '1.4rem' }}>{getAvatarEmoji(user.avatar)}</span>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1E293B' }}>
                  {user.full_name}
                </span>
              </div>

              {/* Minimal Logout Button */}
              <button
                onClick={handleLogout}
                title="Đăng xuất"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#EF4444',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>🚪</span>
                <span>Đăng xuất</span>
              </button>
            </>
          ) : (
            /* Logged Out CTAs */
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => { sound.pop(); openLogin(); }}
                className="btn-secondary"
                style={{ padding: '7px 16px', fontSize: '0.88rem' }}
              >
                <span>🔑 Đăng Nhập</span>
              </button>
              <button
                onClick={() => { sound.pop(); openRegister(); }}
                className="btn-primary"
                style={{ padding: '7px 18px', fontSize: '0.88rem' }}
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
