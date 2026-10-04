import React from 'react';

export default function WeaknessAnalysisCard({ weaknessList = [], onSelectRecommendation }) {
  return (
    <div className="card">
      <div className="card-title">
        <span>📊</span>
        <span>Phân Tích Kết Quả & Điểm Mạnh / Yếu</span>
      </div>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Hệ thống tự động theo dõi và đánh giá mức độ thông thạo từng chuyên đề của bé:
      </p>

      {weaknessList.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
          Bé hãy làm bài tập đầu tiên để hệ thống phân tích năng lực nhé!
        </p>
      ) : (
        weaknessList.map(item => (
          <div key={item.tag} className="weakness-item">
            <div className="weakness-label">
              <span>{item.name}</span>
              <span style={{
                color: item.percentage >= 80 ? '#059669' : (item.percentage >= 60 ? '#D97706' : '#DC2626')
              }}>
                {item.percentage}% {item.percentage >= 80 ? '🌟 Vững' : (item.percentage >= 60 ? '⚡ Cần rèn' : '🚨 Yếu')}
              </span>
            </div>
            <div className="weakness-track">
              <div
                className={`weakness-fill ${item.status}`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))
      )}

      <div style={{
        marginTop: '16px',
        padding: '12px 14px',
        background: '#EFF6FF',
        borderRadius: 'var(--radius-sm)',
        border: '1.5px solid #BFDBFE',
        fontSize: '0.88rem',
        color: '#1E40AF',
        fontWeight: 700
      }}>
        💡 <strong>Nhận xét:</strong> Bé làm rất tốt phần <strong>Hình Học (92%)</strong>, nhưng cần luyện tập thêm phần <strong>Phân Số (60%)</strong> để đạt điểm 10 tuyệt đối!
      </div>
    </div>
  );
}
