import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LeaderboardPage() {
  const { user, getAvatarEmoji } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [user]);

  const loadLeaderboard = async () => {
    setLoading(true);
    const res = await api.getLeaderboard();
    if (res.success && res.leaderboard) {
      setLeaderboard(res.leaderboard);
    }
    setLoading(false);
  };

  const isMe = (item) => {
    if (!user) return false;
    const curName = (user.full_name || '').trim().toLowerCase();
    const curUser = (user.username || '').trim().toLowerCase();
    const itemName = (item.full_name || item.student_name || '').trim().toLowerCase();
    const itemUser = (item.username || '').trim().toLowerCase();
    return (
      (item.id && user.id && String(item.id) === String(user.id)) ||
      (curUser && itemUser && curUser === itemUser) ||
      (curUser && itemName && curUser === itemName) ||
      (curName && itemName && curName === itemName) ||
      (user.parent_phone && item.parent_phone && item.parent_phone === user.parent_phone)
    );
  };

  // Find user rank in full sorted leaderboard
  const myRankIndex = user ? leaderboard.findIndex(isMe) : -1;
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : null;
  const myEntry = myRankIndex >= 0 ? leaderboard[myRankIndex] : null;

  // Top 5 students
  const top5 = leaderboard.slice(0, 5);
  // Is user outside top 5?
  const isOutsideTop5 = user && myRankIndex >= 5 && myEntry;

  const renderRankItem = (item, rankNumber, isCurrentUser) => {
    const rankIdx = rankNumber - 1;
    const rankIcon = rankNumber === 1 ? '🥇' : (rankNumber === 2 ? '🥈' : (rankNumber === 3 ? '🥉' : `#${rankNumber}`));

    // Color theme logic requested:
    // 1. Current user row is ALWAYS green (#DCFCE7, border #22C55E)
    // 2. Non-user rows: Rank 1 -> Gold (#FEF3C7), Rank 2 -> Silver (#F1F5F9), Rank 3 -> Bronze (#FFEDD5), Rank 4-5 -> White (#FFFFFF)
    let bg = '#FFFFFF';
    let border = '1.5px solid #E2E8F0';
    let rankColor = '#475569';

    if (isCurrentUser) {
      bg = '#DCFCE7';
      border = '2.5px solid #22C55E';
      rankColor = '#15803D';
    } else if (rankIdx === 0) {
      bg = '#FEF3C7';
      border = '2px solid #FDE68A';
      rankColor = '#B45309';
    } else if (rankIdx === 1) {
      bg = '#F1F5F9';
      border = '2px solid #CBD5E1';
      rankColor = '#475569';
    } else if (rankIdx === 2) {
      bg = '#FFEDD5';
      border = '2px solid #FDBA74';
      rankColor = '#C2410C';
    }

    const displayName = item.full_name || item.student_name || item.username;
    const hasDistinctUsername = item.username && displayName && displayName.toLowerCase() !== item.username.toLowerCase();

    return (
      <div
        key={item.id || rankNumber}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderRadius: '16px',
          background: bg,
          border: border,
          boxShadow: isCurrentUser ? '0 4px 14px rgba(34, 197, 94, 0.22)' : '0 2px 4px rgba(0,0,0,0.02)',
          transition: 'all 0.2s ease',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, minWidth: '38px', color: rankColor }}>
            {rankIcon}
          </div>
          <span style={{ fontSize: '1.9rem', lineHeight: 1 }}>{getAvatarEmoji(item.avatar)}</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 900, fontSize: '1.05rem', color: isCurrentUser ? '#15803D' : '#0F172A' }}>
                {displayName}
              </span>
              {hasDistinctUsername && (
                <span style={{
                  fontSize: '0.78rem',
                  color: isCurrentUser ? '#166534' : '#64748B',
                  background: isCurrentUser ? 'rgba(34, 197, 94, 0.15)' : '#F1F5F9',
                  padding: '1px 6px',
                  borderRadius: '6px',
                  fontWeight: 700
                }}>
                  @{item.username}
                </span>
              )}
              {isCurrentUser && (
                <span style={{
                  background: '#22C55E',
                  color: '#FFFFFF',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  letterSpacing: '0.3px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}>
                  🌟 BẠN (Hạng #{rankNumber})
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.8rem', color: isCurrentUser ? '#166534' : 'var(--text-muted)', fontWeight: 700, marginTop: '2px' }}>
              {item.class_code ? (
                <>Học sinh Lớp {item.class_name || item.class_code.split('-')[0]} ({item.class_code})</>
              ) : (
                <>Học sinh Khối {item.grade_level || 2} (Chưa vào lớp)</>
              )} • 🔥 Chuỗi {item.streak_days || 1} ngày
            </div>
          </div>
        </div>

        <div className="chip chip-xp" style={{
          fontSize: '1rem',
          fontWeight: 900,
          background: isCurrentUser ? '#BBF7D0' : undefined,
          color: isCurrentUser ? '#15803D' : undefined,
          border: isCurrentUser ? '1.5px solid #86EFAC' : undefined
        }}>
          <span>⭐ {item.xp || 0} XP</span>
        </div>
      </div>
    );
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
        ) : leaderboard.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Chưa có học sinh nào trên bảng vàng.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Render Top 5 */}
            {top5.map((item, idx) => {
              const isCurrentUser = isMe(item);
              return renderRankItem(item, idx + 1, isCurrentUser);
            })}

            {/* If user is outside top 5 (rank 6, 7+), render gap and user's row */}
            {isOutsideTop5 && (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '8px 0',
                  color: '#94A3B8',
                  fontWeight: 900,
                  fontSize: '1.3rem',
                  letterSpacing: '5px'
                }}>
                  •••••
                </div>

                {/* Current User Row */}
                {renderRankItem(myEntry, myRank, true)}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
