import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { sound } from '../services/audio';

export default function Navbar({ activeTab, setActiveTab, onOpenJoinClass }) {
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
      background: 'rgba(255, 255, 255, 0.96)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1.5px solid #E2E8F0',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
    }}>
      <div style={{
        maxWidth: '1360px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '62px',
        padding: '0 20px',
        gap: '12px'
      }}>
        {/* Left: Brand Logo */}
        <div
          onClick={() => { sound.pop(); setActiveTab('dashboard'); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none',
            flexShrink: 0
          }}
        >
          <div style={{
            fontSize: '1.4rem',
            background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1.5px solid #C7D2FE',
            boxShadow: '0 2px 6px rgba(79, 70, 229, 0.12)'
          }}>
            🎒
          </div>
          <div>
            <span style={{
              fontSize: '1.2rem',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.3px',
              display: 'block',
              lineHeight: 1.1,
              whiteSpace: 'nowrap'
            }}>
              EduKids
            </span>
            <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 800, whiteSpace: 'nowrap' }}>
              Tiểu Học Thông Minh
            </span>
          </div>
        </div>

        {/* Center: Clean Navigation Links with No Text Wrapping */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexShrink: 0
        }}>
          {user && user.role === 'student' && (
            <>
              <button
                type="button"
                onClick={() => { sound.pop(); setActiveTab('dashboard'); }}
                style={{
                  padding: '7px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  background: activeTab === 'dashboard' ? '#4F46E5' : 'transparent',
                  color: activeTab === 'dashboard' ? '#FFFFFF' : '#475569',
                  boxShadow: activeTab === 'dashboard' ? '0 3px 10px rgba(79, 70, 229, 0.25)' : 'none',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  outline: 'none'
                }}
              >
                <span>🏠</span>
                <span>Trang Chủ</span>
              </button>

              <button
                type="button"
                onClick={() => { sound.pop(); setActiveTab('subjects'); }}
                style={{
                  padding: '7px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  background: activeTab === 'subjects' ? '#4F46E5' : 'transparent',
                  color: activeTab === 'subjects' ? '#FFFFFF' : '#475569',
                  boxShadow: activeTab === 'subjects' ? '0 3px 10px rgba(79, 70, 229, 0.25)' : 'none',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  outline: 'none'
                }}
              >
                <span>📚</span>
                <span>Môn Học & Bài Tập</span>
              </button>

              <button
                type="button"
                onClick={() => { sound.pop(); setActiveTab('leaderboard'); }}
                style={{
                  padding: '7px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  background: activeTab === 'leaderboard' ? '#4F46E5' : 'transparent',
                  color: activeTab === 'leaderboard' ? '#FFFFFF' : '#475569',
                  boxShadow: activeTab === 'leaderboard' ? '0 3px 10px rgba(79, 70, 229, 0.25)' : 'none',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  outline: 'none'
                }}
              >
                <span>🏆</span>
                <span>Bảng Vàng</span>
              </button>
            </>
          )}

          {user && user.role === 'teacher' && (
            <button
              type="button"
              onClick={() => { sound.pop(); setActiveTab('teacher'); }}
              style={{
                padding: '7px 16px',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                background: '#FEF3C7',
                color: '#B45309',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                outline: 'none'
              }}
            >
              <span>👩‍🏫</span>
              <span>Quản Lý Lớp Học & Bài Tập</span>
            </button>
          )}

          {user && user.role === 'admin' && (
            <button
              type="button"
              onClick={() => { sound.pop(); setActiveTab('admin'); }}
              style={{
                padding: '7px 16px',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                background: '#ECFDF5',
                color: '#065F46',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                outline: 'none'
              }}
            >
              <span>👨‍💼</span>
              <span>Quản Trị Hệ Thống</span>
            </button>
          )}
        </nav>

        {/* Right: Consolidated Student Badges, Audio, User Profile & Logout */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0
        }}>
          {user ? (
            <>
              {/* Consolidated Student Status Pill */}
              {user.role === 'student' && (
                <div
                  onClick={() => { sound.pop(); setShowProfileModal(true); }}
                  title="Bấm để đổi khối lớp hoặc avatar"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#F8FAFC',
                    border: '1.5px solid #E2E8F0',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span style={{
                    color: '#4F46E5',
                    background: '#EEF2FF',
                    padding: '2px 10px',
                    borderRadius: '9999px',
                    fontWeight: 900
                  }}>
                    🏫 {user.class_code ? `Lớp ${user.class_name || user.class_code.split('-')[0]} (${user.class_code})` : `Lớp ${user.grade_level || 2}`}
                  </span>
                  <span style={{ color: '#D97706', fontWeight: 800 }}>
                    ⭐ {user.xp || 0} XP
                  </span>
                  <span style={{ color: '#EF4444', fontWeight: 800 }}>
                    🔥 {user.streak_days || 1}d
                  </span>
                </div>
              )}

              {/* Sound Toggle Button */}
              <button
                type="button"
                onClick={handleSound}
                title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                style={{
                  background: '#F8FAFC',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '10px',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  outline: 'none',
                  flexShrink: 0
                }}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>

              {/* Student Join / Change Class Button */}
              {user.role === 'student' && (
                <button
                  type="button"
                  onClick={() => { sound.pop(); if (onOpenJoinClass) onOpenJoinClass(); }}
                  title="Nhập mã lớp học của Thầy/Cô để vào lớp"
                  style={{
                    background: '#EEF2FF',
                    border: '1.5px solid #C7D2FE',
                    color: '#4338CA',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    padding: '5px 10px',
                    borderRadius: '10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap',
                    outline: 'none'
                  }}
                >
                  <span>🔑</span>
                  <span>Đổi / Vào Lớp</span>
                </button>
              )}

              {/* User Avatar & Name Profile Chip */}
              <div
                onClick={() => { sound.pop(); setShowProfileModal(true); }}
                title="Hồ sơ tài khoản"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  padding: '4px 10px',
                  borderRadius: '10px',
                  background: '#F1F5F9',
                  border: '1.5px solid #E2E8F0',
                  whiteSpace: 'nowrap'
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{getAvatarEmoji(user.avatar)}</span>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1E293B' }}>
                  {user.full_name || user.username}
                </span>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                title="Đăng xuất"
                style={{
                  background: '#FEF2F2',
                  border: '1.5px solid #FECDD3',
                  color: '#DC2626',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  padding: '5px 10px',
                  borderRadius: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                  outline: 'none'
                }}
              >
                <span>🚪</span>
                <span>Đăng xuất</span>
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', whiteSpace: 'nowrap' }}>
              <button
                type="button"
                onClick={() => { sound.pop(); if (onOpenJoinClass) onOpenJoinClass(); }}
                style={{
                  background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                  border: '1.5px solid #818CF8',
                  color: '#3730A3',
                  fontWeight: 900,
                  fontSize: '0.86rem',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.15)',
                  outline: 'none'
                }}
              >
                <span>🔑</span>
                <span>Nhập Mã Lớp</span>
              </button>
              <button
                onClick={() => { sound.pop(); openLogin(); }}
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
              >
                <span>Đăng Nhập</span>
              </button>
              <button
                onClick={() => { sound.pop(); openRegister(); }}
                className="btn-primary"
                style={{ padding: '6px 16px', fontSize: '0.85rem' }}
              >
                <span>⭐ Đăng Ký</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
