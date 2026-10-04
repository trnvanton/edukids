import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LeaderboardPage() {
  const { getAvatarEmoji } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    const res = await api.getLeaderboard();
    if (res.success && res.leaderboard) {
      setLeaderboard(res.leaderboard);
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ padding: '24px 0 60px 0' }}>
      <div className="card" style={{ maxWidth: '750px', margin: '0 auto', padding: '32px' }}>
        <div className="card-title" style={{ justifyContent: 'center', fontSize: '1.6rem', marginBottom: '8px' }}>
          <span>🏆</span>
          <span>Bảng Vàng Vinh Danh Trạng Nguyên Nhí</span>
        </div>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '24px', fontWeight: 600 }}>
          Top các bạn học sinh chăm chỉ tích lũy nhiều điểm kinh nghiệm (XP) nhất toàn trường:
        </p>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px' }}>⏳ Đang tải bảng vàng...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {leaderboard.map((item, idx) => {
              const rankIcon = idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : `#${idx + 1}`));
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    borderRadius: 'var(--radius-md)',
                    background: idx < 3 ? '#FEF3C7' : '#F8FAFC',
                    border: idx < 3 ? '2px solid #FDE68A' : '1.5px solid var(--border-color)',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, minWidth: '36px' }}>{rankIcon}</div>
                    <span style={{ fontSize: '1.8rem' }}>{getAvatarEmoji(item.avatar)}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{item.full_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                        Học sinh Lớp {item.grade_level} • 🔥 Chuỗi {item.streak_days} ngày
                      </div>
                    </div>
                  </div>

                  <div className="chip chip-xp" style={{ fontSize: '1rem', fontWeight: 900 }}>
                    <span>⭐ {item.xp} XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
