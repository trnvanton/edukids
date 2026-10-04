import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function BadgeList({ badges = [] }) {
  const { user } = useAuth();
  const currentXp = user?.xp || 0;

  const defaultBadges = [
    { id: 1, code: 'starter', name: 'Mầm Non Chăm Học', icon: '🥉', description: 'Hoàn thành bài tập đầu tiên', min_xp: 20 },
    { id: 2, code: 'math_star', name: 'Siêu Toán Học', icon: '🥈', description: 'Đạt từ 150 XP môn học', min_xp: 150 },
    { id: 3, code: 'vietnamese_king', name: 'Vua Tiếng Việt & Anh', icon: '🥇', description: 'Đạt từ 300 XP tổng hợp', min_xp: 300 },
    { id: 4, code: 'streak_7', name: 'Lửa Chăm Chỉ 7 Ngày', icon: '🔥', description: 'Học tập kiên trì liên tục', min_xp: 500 },
    { id: 5, code: 'super_scholar', name: 'Trạng Nguyên Toàn Năng', icon: '👑', description: 'Tích lũy 1,000 XP xuất sắc', min_xp: 1000 }
  ];

  const list = (badges && badges.length > 0) ? badges : defaultBadges;

  return (
    <div className="card" style={{ padding: '26px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            fontSize: '1.8rem',
            background: 'linear-gradient(135deg, #FDE68A, #F59E0B)',
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)'
          }}>
            🏆
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>
              Bộ Sưu Tập Huy Hiệu Danh Dự
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Tích lũy điểm XP qua từng bài tập để mở khóa toàn bộ huy hiệu danh giá
            </p>
          </div>
        </div>

        <div style={{
          background: '#EEF2FF',
          padding: '6px 14px',
          borderRadius: '9999px',
          fontSize: '0.85rem',
          fontWeight: 800,
          color: 'var(--primary)',
          border: '1px solid #C7D2FE'
        }}>
          ⭐ Điểm của bé: {currentXp} XP
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {list.map(b => {
          const isUnlocked = b.unlocked || currentXp >= (b.min_xp || 0);
          const percent = Math.min(100, Math.round((currentXp / (b.min_xp || 1)) * 100));

          return (
            <div
              key={b.id}
              style={{
                borderRadius: '16px',
                padding: '18px 16px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.25s ease',
                background: isUnlocked
                  ? 'linear-gradient(145deg, #FFFFFF, #FFFBEB)'
                  : '#F8FAFC',
                border: isUnlocked
                  ? '2px solid #FCD34D'
                  : '1.5px solid #E2E8F0',
                boxShadow: isUnlocked
                  ? '0 8px 20px -4px rgba(245, 158, 11, 0.2)'
                  : 'none',
                transform: isUnlocked ? 'translateY(-2px)' : 'none'
              }}
            >
              {/* Badge Icon with glowing halo if unlocked */}
              <div style={{
                fontSize: '2.8rem',
                marginBottom: '10px',
                filter: isUnlocked ? 'drop-shadow(0 4px 8px rgba(245, 158, 11, 0.35))' : 'grayscale(1) opacity(0.4)',
                transform: isUnlocked ? 'scale(1.08)' : 'scale(0.95)',
                transition: 'all 0.3s ease'
              }}>
                {b.icon}
              </div>

              {/* Badge Title */}
              <h4 style={{
                fontSize: '0.98rem',
                fontWeight: 900,
                color: isUnlocked ? '#92400E' : '#64748B',
                marginBottom: '4px'
              }}>
                {b.name}
              </h4>

              <p style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                marginBottom: '12px',
                minHeight: '28px',
                lineHeight: 1.35
              }}>
                {b.description || `Đạt mốc ${b.min_xp} XP`}
              </p>

              {/* Status Chip / Progress Bar */}
              {isUnlocked ? (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#FEF3C7',
                  color: '#B45309',
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  border: '1px solid #FDE68A'
                }}>
                  <span>✨ ĐÃ SỞ HỮU</span>
                </div>
              ) : (
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#94A3B8',
                    marginBottom: '4px'
                  }}>
                    <span>Tiến độ</span>
                    <span>{currentXp} / {b.min_xp} XP</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    background: '#E2E8F0',
                    borderRadius: '9999px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${percent}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #3B82F6, #6366F1)',
                      borderRadius: '9999px',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
