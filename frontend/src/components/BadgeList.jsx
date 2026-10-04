import React from 'react';

export default function BadgeList({ badges = [] }) {
  return (
    <div className="card">
      <div className="card-title">
        <span>🏆</span>
        <span>Bộ Sưu Tập Huy Hiệu Danh Dự</span>
      </div>

      <div className="badge-grid">
        {badges.map(b => (
          <div key={b.id} className={`badge-item ${b.unlocked ? 'unlocked' : ''}`}>
            <div className="badge-icon" style={{ filter: b.unlocked ? 'none' : 'grayscale(1)' }}>
              {b.icon}
            </div>
            <div className="badge-name">{b.name}</div>
            <div className="badge-status">
              {b.unlocked ? '✅ Đã mở khóa' : `🔒 Cần ${b.min_xp} XP`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
