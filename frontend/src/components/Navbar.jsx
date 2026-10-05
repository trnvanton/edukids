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
    <header className="edukids-header">
      <style>{`
        .edukids-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1.5px solid #E2E8F0;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
        }
        .header-inner {
          max-width: 1320px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 60px;
          padding: 0 16px;
          gap: 10px;
        }
        .header-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
          flex-shrink: 0;
        }
        .header-logo-icon {
          font-size: 1.3rem;
          background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #C7D2FE;
          box-shadow: 0 2px 5px rgba(79, 70, 229, 0.12);
        }
        .header-logo-title {
          font-size: 1.15rem;
          font-weight: 900;
          background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.3px;
          line-height: 1.1;
        }
        .header-logo-sub {
          font-size: 0.65rem;
          color: #94A3B8;
          font-weight: 800;
          display: block;
        }

        .header-nav {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }
        .nav-item-btn {
          padding: 6px 10px;
          border-radius: 10px;
          border: none;
          font-weight: 800;
          font-size: 0.84rem;
          cursor: pointer;
          background: transparent;
          color: #475569;
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          outline: none;
        }
        .nav-item-btn:hover {
          background: #F1F5F9;
          color: #1E293B;
        }
        .nav-item-btn.active {
          background: #4F46E5;
          color: #FFFFFF;
          box-shadow: 0 3px 8px rgba(79, 70, 229, 0.28);
        }
        .nav-item-btn.active-red {
          background: #DC2626;
          color: #FFFFFF;
          box-shadow: 0 3px 8px rgba(220, 38, 38, 0.28);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .stat-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          padding: 4px 8px;
          border-radius: 9999px;
          font-size: 0.78rem;
          font-weight: 800;
          white-space: nowrap;
          cursor: pointer;
        }
        .stat-pill:hover {
          background: #EEF2FF;
          border-color: #C7D2FE;
        }

        .user-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 9999px;
          background: #F1F5F9;
          border: 1px solid #E2E8F0;
          white-space: nowrap;
          max-width: 120px;
          font-size: 0.78rem;
          font-weight: 800;
          color: #1E293B;
          transition: all 0.15s ease;
        }
        .user-chip:hover {
          background: #E2E8F0;
        }
        .user-chip-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .icon-action-btn {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          cursor: pointer;
          outline: none;
          transition: all 0.15s ease;
        }
        .icon-action-btn:hover {
          background: #F1F5F9;
          border-color: #CBD5E1;
        }

        .logout-btn {
          background: #FEF2F2;
          border: 1px solid #FECDD3;
          color: #DC2626;
          font-weight: 800;
          font-size: 0.78rem;
          cursor: pointer;
          padding: 5px 8px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          white-space: nowrap;
          outline: none;
          transition: all 0.15s ease;
        }
        .logout-btn:hover {
          background: #FEE2E2;
          border-color: #FDA4AF;
        }

        @media (max-width: 1100px) {
          .header-logo-sub { display: none; }
          .nav-item-btn { padding: 5px 8px; font-size: 0.8rem; }
          .stat-pill { padding: 3px 6px; }
        }
        @media (max-width: 900px) {
          .header-inner { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .header-nav { gap: 2px; }
        }
      `}</style>

      <div className="header-inner">
        {/* Brand Logo */}
        <div
          className="header-logo"
          onClick={() => { sound.pop(); setActiveTab('dashboard'); }}
        >
          <div className="header-logo-icon">🎒</div>
          <div>
            <span className="header-logo-title">EduKids</span>
            <span className="header-logo-sub">Tiểu Học Thông Minh</span>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="header-nav">
          {user && user.role === 'student' && (
            <>
              <button
                type="button"
                className={`nav-item-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => { sound.pop(); setActiveTab('dashboard'); }}
              >
                <span>🏠</span>
                <span>Trang Chủ</span>
              </button>

              <button
                type="button"
                className={`nav-item-btn ${activeTab === 'subjects' ? 'active' : ''}`}
                onClick={() => { sound.pop(); setActiveTab('subjects'); }}
              >
                <span>📚</span>
                <span>Bài Tập</span>
              </button>

              <button
                type="button"
                className={`nav-item-btn ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => { sound.pop(); setActiveTab('history'); }}
              >
                <span>📜</span>
                <span>Lịch Sử</span>
              </button>

              <button
                type="button"
                className={`nav-item-btn ${activeTab === 'mistakes' ? 'active-red' : ''}`}
                onClick={() => { sound.pop(); setActiveTab('mistakes'); }}
                style={{ color: activeTab === 'mistakes' ? '#FFFFFF' : '#DC2626' }}
              >
                <span>🎯</span>
                <span>Sổ Lỗi</span>
              </button>

              <button
                type="button"
                className={`nav-item-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
                onClick={() => { sound.pop(); setActiveTab('leaderboard'); }}
              >
                <span>🏆</span>
                <span>Bảng Vàng</span>
              </button>
            </>
          )}

          {user && user.role === 'teacher' && (
            <button
              type="button"
              className="nav-item-btn active"
              style={{ background: '#FEF3C7', color: '#B45309' }}
              onClick={() => { sound.pop(); setActiveTab('teacher'); }}
            >
              <span>👩‍🏫</span>
              <span>Quản Lý Lớp Học & Bài Tập</span>
            </button>
          )}

          {user && user.role === 'admin' && (
            <button
              type="button"
              className="nav-item-btn active"
              style={{ background: '#ECFDF5', color: '#065F46' }}
              onClick={() => { sound.pop(); setActiveTab('admin'); }}
            >
              <span>👨‍💼</span>
              <span>Quản Trị Hệ Thống</span>
            </button>
          )}
        </nav>

        {/* Right: Actions, Badges & Profile */}
        <div className="header-actions">
          {user ? (
            <>
              {/* Student Stats & Class Badge */}
              {user.role === 'student' && (
                <>
                  <div
                    className="stat-pill"
                    onClick={() => { sound.pop(); setShowProfileModal(true); }}
                    title={`Khối ${user.grade_level || 2} • Bấm để đổi thông tin / xem hồ sơ`}
                  >
                    <span style={{
                      color: user.class_code ? '#4F46E5' : '#D97706',
                      background: user.class_code ? '#EEF2FF' : '#FEF3C7',
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      fontWeight: 900,
                      fontSize: '0.74rem'
                    }}>
                      {user.class_code ? (user.class_name ? `Lớp ${user.class_name}` : user.class_code) : `Khối ${user.grade_level || 2}`}
                    </span>
                    <span style={{ color: '#D97706' }}>⭐ {user.xp || 0}</span>
                    <span style={{ color: '#EF4444' }}>🔥 {user.streak_days || 1}d</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => { sound.pop(); if (onOpenJoinClass) onOpenJoinClass(); }}
                    title={user.class_code ? `Đang ở lớp ${user.class_name || user.class_code}. Bấm để đổi mã lớp` : "Nhập mã lớp của Thầy/Cô"}
                    style={{
                      background: user.class_code ? '#F0FDF4' : '#EEF2FF',
                      border: user.class_code ? '1px solid #BBF7D0' : '1px solid #C7D2FE',
                      color: user.class_code ? '#15803D' : '#4338CA',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      padding: '4px 7px',
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      whiteSpace: 'nowrap',
                      outline: 'none'
                    }}
                  >
                    <span>{user.class_code ? '🔄' : '🔑'}</span>
                    <span>{user.class_code ? 'Đổi Lớp' : 'Vào Lớp'}</span>
                  </button>
                </>
              )}

              {/* Sound Toggle */}
              <button
                type="button"
                className="icon-action-btn"
                onClick={handleSound}
                title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>

              {/* User Avatar & Name */}
              <div
                className="user-chip"
                onClick={() => { sound.pop(); setShowProfileModal(true); }}
                title={`Hồ sơ: ${user.full_name || user.username} (Bấm để mở hồ sơ)`}
              >
                <span style={{ fontSize: '1.05rem', flexShrink: 0 }}>{getAvatarEmoji(user.avatar)}</span>
                <span className="user-chip-name">{user.full_name || user.username}</span>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                className="logout-btn"
                onClick={handleLogout}
                title="Đăng xuất khỏi tài khoản"
              >
                <span>🚪</span>
                <span>Thoát</span>
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', whiteSpace: 'nowrap' }}>
              <button
                type="button"
                onClick={() => { sound.pop(); if (onOpenJoinClass) onOpenJoinClass(); }}
                style={{
                  background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                  border: '1.5px solid #818CF8',
                  color: '#3730A3',
                  fontWeight: 900,
                  fontSize: '0.82rem',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  outline: 'none'
                }}
              >
                <span>🔑</span>
                <span>Nhập Mã Lớp</span>
              </button>
              <button
                onClick={() => { sound.pop(); openLogin(); }}
                className="btn-secondary"
                style={{ padding: '5px 10px', fontSize: '0.82rem' }}
              >
                <span>Đăng Nhập</span>
              </button>
              <button
                onClick={() => { sound.pop(); openRegister(); }}
                className="btn-primary"
                style={{ padding: '5px 12px', fontSize: '0.82rem' }}
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
