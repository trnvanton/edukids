import React, { useState } from 'react';
import { useAuth, mascotMap } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { sound } from '../services/audio';

export default function AuthModal() {
  const {
    showAuthModal,
    setShowAuthModal,
    authModalMode,
    setAuthModalMode,
    login,
    register
  } = useAuth();
  const { showSuccess, showError } = useToast();

  // Login form states
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form states
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regGrade, setRegGrade] = useState('2');
  const [regAvatar, setRegAvatar] = useState('mascot-bear');
  const [regRole, setRegRole] = useState('student');

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!showAuthModal) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    sound.pop();
    const res = await login(loginUsername, loginPassword);
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.message);
      showError('Đăng nhập thất bại', res.message);
    } else {
      sound.correct();
      showSuccess('Đăng nhập thành công! 🚀', `Chào mừng ${res.user?.full_name || loginUsername} quay trở lại học tập!`);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    sound.pop();
    const res = await register({
      full_name: regFullName,
      username: regUsername,
      password: regPassword,
      grade_level: parseInt(regGrade, 10),
      avatar: regAvatar,
      role: regRole
    });
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.message);
      showError('Đăng ký thất bại', res.message);
    } else {
      sound.fanfare();
      showSuccess(
        `Chào mừng ${regFullName}! 🎉`,
        `Đăng ký thành công! Bé được tặng +50 XP khởi động và vào thẳng Lớp ${regGrade}!`
      );
    }
  };

  const quickDemoLogin = (username, password) => {
    setLoginUsername(username);
    setLoginPassword(password);
    login(username, password);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%', position: 'relative', animation: 'scaleUp 0.25s ease-out', padding: '30px' }}>
        {/* Close Button */}
        <button
          onClick={() => setShowAuthModal(false)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#F1F5F9',
            border: 'none',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '1.1rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ✕
        </button>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 'var(--radius-full)', padding: '4px', marginBottom: '22px' }}>
          <button
            onClick={() => { sound.pop(); setAuthModalMode('login'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              background: authModalMode === 'login' ? 'white' : 'transparent',
              color: authModalMode === 'login' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: authModalMode === 'login' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'var(--transition)'
            }}
          >
            🔑 Đăng Nhập
          </button>
          <button
            onClick={() => { sound.pop(); setAuthModalMode('register'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              background: authModalMode === 'register' ? 'white' : 'transparent',
              color: authModalMode === 'register' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: authModalMode === 'register' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'var(--transition)'
            }}
          >
            ⭐ Đăng Ký Mới
          </button>
        </div>

        {/* Error message alert */}
        {errorMsg && (
          <div style={{
            background: '#FEE2E2',
            color: '#991B1B',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 700,
            marginBottom: '16px',
            border: '1px solid #FECDD3'
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* LOGIN FORM */}
        {authModalMode === 'login' && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '0.9rem', marginBottom: '6px' }}>
                Tên đăng nhập:
              </label>
              <input
                type="text"
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                placeholder="Ví dụ: student1, hocsinh1..."
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '2px solid var(--border-color)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  fontFamily: 'inherit'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '0.9rem', marginBottom: '6px' }}>
                Mật khẩu:
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '2px solid var(--border-color)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  fontFamily: 'inherit'
                }}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
            >
              <span>{loading ? '⏳ Đang đăng nhập...' : 'Đăng Nhập Ngay 🚀'}</span>
            </button>

            {/* Quick Demo Login Chips */}
            <div style={{ marginTop: '22px', borderTop: '1.5px dashed var(--border-color)', paddingTop: '16px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '10px' }}>
                ⚡ Hoặc đăng nhập nhanh 1 chạm bằng tài khoản mẫu:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => quickDemoLogin('admin', '123456')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: '1.5px solid #CBD5E1',
                    background: '#F1F5F9',
                    color: '#0F172A',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>👨‍💼</span>
                  <div>
                    <div style={{ fontWeight: 900, color: '#1E293B' }}>Admin Quản Trị</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>admin / 123456</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => quickDemoLogin('teacher1', '123456')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: '1.5px solid #FDE68A',
                    background: '#FEF3C7',
                    color: '#92400E',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>👩‍🏫</span>
                  <div>
                    <div style={{ fontWeight: 900, color: '#B45309' }}>Cô Hoàng Mai</div>
                    <div style={{ fontSize: '0.72rem', color: '#92400E' }}>teacher1 / 123456</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => quickDemoLogin('student_lop2', '123456')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: '1.5px solid #A7F3D0',
                    background: '#ECFDF5',
                    color: '#065F46',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>🐥</span>
                  <div>
                    <div style={{ fontWeight: 900, color: '#047857' }}>Học Sinh Lớp 2</div>
                    <div style={{ fontSize: '0.72rem', color: '#065F46' }}>Bé Bảo Ngọc</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => quickDemoLogin('student1', '123456')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: '1.5px solid #C7D2FE',
                    background: '#EEF2FF',
                    color: '#3730A3',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>👦</span>
                  <div>
                    <div style={{ fontWeight: 900, color: '#4338CA' }}>Học Sinh Lớp 4</div>
                    <div style={{ fontSize: '0.72rem', color: '#4F46E5' }}>Bé Minh Anh</div>
                  </div>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* REGISTER FORM */}
        {authModalMode === 'register' && (
          <form onSubmit={handleRegister}>
            {/* Role Switcher */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '6px' }}>
                Loại tài khoản đăng ký:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setRegRole('student')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: regRole === 'student' ? '2px solid var(--primary)' : '1.5px solid var(--border-color)',
                    background: regRole === 'student' ? '#EEF2FF' : '#F8FAFC',
                    color: regRole === 'student' ? 'var(--primary)' : '#64748B',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  👦 Bé Học Sinh
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('teacher')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: regRole === 'teacher' ? '2px solid #D97706' : '1.5px solid var(--border-color)',
                    background: regRole === 'teacher' ? '#FEF3C7' : '#F8FAFC',
                    color: regRole === 'teacher' ? '#B45309' : '#64748B',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  👩‍🏫 Thầy / Cô Giáo
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '0.9rem', marginBottom: '4px' }}>
                {regRole === 'student' ? 'Họ và tên của bé:' : 'Họ và tên giáo viên:'}
              </label>
              <input
                type="text"
                value={regFullName}
                onChange={e => setRegFullName(e.target.value)}
                placeholder={regRole === 'student' ? 'Ví dụ: Bé Trần Tuấn Kiệt...' : 'Ví dụ: Cô Nguyễn Mai Phương...'}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontWeight: 700 }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '4px' }}>
                  Tên đăng nhập:
                </label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={e => setRegUsername(e.target.value)}
                  placeholder={regRole === 'student' ? 'tuankiet2017' : 'cophuong2025'}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontWeight: 700 }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '4px' }}>
                  Mật khẩu:
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Mật khẩu..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontWeight: 700 }}
                  required
                />
              </div>
            </div>

            {/* Select Grade for Student / Teacher */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '0.9rem', marginBottom: '4px', color: 'var(--primary)' }}>
                {regRole === 'student' ? '🏫 Bé đang học Khối Lớp nào?' : '🏫 Khối lớp phụ trách / giảng dạy:'}
              </label>
              <select
                value={regGrade}
                onChange={e => setRegGrade(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '2px solid var(--primary)',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  background: '#EEF2FF',
                  color: 'var(--primary)',
                  cursor: 'pointer'
                }}
              >
                <option value="1">🌱 Lớp 1 (Chữ cái & số từ 0 - 100)</option>
                <option value="2">🐥 Lớp 2 (Cộng trừ có nhớ & bảng nhân 2, 5)</option>
                <option value="3">🐱 Lớp 3 (Bảng cửu chương nhân chia & chu vi)</option>
                <option value="4">🚀 Lớp 4 (Phân số, hình học & từ loại)</option>
                <option value="5">👑 Lớp 5 (Số thập phân, % & chuyển cấp)</option>
              </select>
            </div>

            {/* Select Mascot Avatar */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '6px' }}>
                Chọn hình đại diện / linh vật:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {Object.keys(mascotMap).map(key => (
                  <div
                    key={key}
                    onClick={() => setRegAvatar(key)}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      background: regAvatar === key ? 'var(--primary-light)' : '#F8FAFC',
                      border: regAvatar === key ? '2px solid var(--primary)' : '1.5px solid var(--border-color)',
                      transform: regAvatar === key ? 'scale(1.15)' : 'none',
                      transition: 'var(--transition)'
                    }}
                  >
                    {mascotMap[key]}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', background: 'linear-gradient(135deg, #10B981, #059669)' }}
            >
              <span>{loading ? '⏳ Đang tạo tài khoản...' : (regRole === 'teacher' ? 'Đăng Ký Tài Khoản Giáo Viên 👩‍🏫' : 'Tạo Tài Khoản Bé & Nhận 50 XP 🌟')}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
