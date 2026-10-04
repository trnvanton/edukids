import React, { useState, useEffect } from 'react';
import { useAuth, mascotMap } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { sound } from '../services/audio';

export default function ProfileModal() {
  const { user, updateProfile, showProfileModal, setShowProfileModal } = useAuth();
  const { showSuccess } = useToast();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [gradeLevel, setGradeLevel] = useState(user?.grade_level || 1);
  const [avatar, setAvatar] = useState(user?.avatar || 'mascot-bear');

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setGradeLevel(user.grade_level || 1);
      setAvatar(user.avatar || 'mascot-bear');
    }
  }, [user]);

  if (!showProfileModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    sound.pop();
    updateProfile({
      full_name: fullName,
      grade_level: parseInt(gradeLevel, 10),
      avatar
    });
    setShowProfileModal(false);
    showSuccess(
      'Cập nhật thành công! 🎒',
      `Bé hiện đang học Lớp ${gradeLevel}. Toàn bộ bài học đã được điều chỉnh sang Lớp ${gradeLevel}!`
    );
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
      padding: '20px'
    }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%', position: 'relative', animation: 'scaleUp 0.2s ease-out' }}>
        <button
          onClick={() => setShowProfileModal(false)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#F1F5F9',
            border: 'none',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 800
          }}
        >
          ✕
        </button>

        <h3 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '6px' }}>
          🎒 Hồ Sơ & Đổi Khối Lớp Học
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
          Bé có thể đổi tên gọi, chọn linh vật mới hoặc chuyển sang Lớp mới khi bắt đầu năm học mới:
        </p>

        <form onSubmit={handleSubmit}>
          {/* Current Class Info */}
          {user?.class_code && (
            <div style={{
              background: '#F5F3FF',
              border: '1.5px solid #DDD6FE',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6D28D9', display: 'block' }}>🏫 LỚP HỌC HIỆN TẠI:</span>
                <strong style={{ fontSize: '0.95rem', color: '#4C1D95' }}>
                  Lớp {user.class_name || user.class_code.split('-')[0]} (Mã: {user.class_code})
                </strong>
              </div>
            </div>
          )}

          {/* Full Name */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontWeight: 800, fontSize: '0.9rem', marginBottom: '6px' }}>
              Tên gọi của bé:
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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

          {/* Grade Selector */}
          {user.role === 'student' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '0.9rem', marginBottom: '6px' }}>
                🏫 Khối Lớp Của Bé:
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '2.5px solid var(--primary)',
                  fontWeight: 800,
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  background: '#EEF2FF',
                  color: 'var(--primary)',
                  cursor: 'pointer'
                }}
              >
                <option value="1">🌱 Lớp 1 (Làm quen chữ & số 0-100)</option>
                <option value="2">🐥 Lớp 2 (Bảng nhân 2, 5 & cộng có nhớ)</option>
                <option value="3">🐱 Lớp 3 (Bảng cửu chương & nhân chia 1000)</option>
                <option value="4">🚀 Lớp 4 (Phân số, hình học & từ loại)</option>
                <option value="5">👑 Lớp 5 (Số thập phân, % & chuyển cấp)</option>
              </select>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                💡 Khi bé lên lớp mới (ví dụ sau 1 năm lên Lớp 3), hãy chọn lại ở đây để hệ thống mở khóa bài tập lớp mới!
              </span>
            </div>
          )}

          {/* Avatar Selector */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontWeight: 800, fontSize: '0.9rem', marginBottom: '8px' }}>
              Chọn bạn linh vật đồng hành:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {Object.keys(mascotMap).map(key => (
                <div
                  key={key}
                  onClick={() => setAvatar(key)}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.6rem',
                    cursor: 'pointer',
                    background: avatar === key ? 'var(--primary-light)' : '#F8FAFC',
                    border: avatar === key ? '2.5px solid var(--primary)' : '2px solid var(--border-color)',
                    transform: avatar === key ? 'scale(1.15)' : 'none',
                    transition: 'var(--transition)'
                  }}
                >
                  {mascotMap[key]}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            <span>Lưu Thay Đổi & Cập Nhật Lớp Học 🚀</span>
          </button>
        </form>
      </div>
    </div>
  );
}
