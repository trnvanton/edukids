import React from 'react';

export default function WeaknessAnalysisCard({ weaknessList = [] }) {
  const hasSubmissions = weaknessList.some(w => (w.totalQuestions || 0) > 0 || (w.percentage || 0) > 0);

  // Find strongest and weakest dynamically
  const sorted = [...weaknessList].filter(w => (w.totalQuestions || 0) > 0).sort((a, b) => b.percentage - a.percentage);
  const strongest = sorted[0];
  const weakest = sorted.length > 1 ? sorted[sorted.length - 1] : null;

  return (
    <div className="card" style={{ padding: '24px' }}>
      <div className="card-title" style={{ marginBottom: '8px' }}>
        <span>📊</span>
        <span>Phân Tích Kết Quả & Điểm Mạnh / Yếu</span>
      </div>

      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
        Hệ thống AI tự động theo dõi và đánh giá mức độ thông thạo từng chuyên đề bài học:
      </p>

      {weaknessList.length === 0 || !hasSubmissions ? (
        <div style={{
          textAlign: 'center',
          padding: '24px 16px',
          background: '#F8FAFC',
          borderRadius: '12px',
          border: '1.5px dashed #CBD5E1',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '2.4rem', marginBottom: '8px' }}>🌱</div>
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#334155', margin: '0 0 6px 0' }}>
            Bé là thành viên mới chăm ngoan!
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Hãy hoàn thành bài tập đầu tiên để hệ thống phân tích mức độ thông thạo và đề xuất lộ trình nâng cao nhé!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '18px' }}>
          {weaknessList.map(item => (
            <div key={item.tag} className="weakness-item">
              <div className="weakness-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{item.name}</span>
                <span style={{
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  color: item.percentage >= 80 ? '#059669' : (item.percentage >= 60 ? '#D97706' : '#DC2626')
                }}>
                  {item.percentage}% {item.percentage >= 80 ? '🌟 Vững' : (item.percentage >= 60 ? '⚡ Cần rèn' : '🚨 Cần kèm')}
                </span>
              </div>
              <div className="weakness-track" style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
                <div
                  className="weakness-fill"
                  style={{
                    width: `${item.percentage}%`,
                    height: '100%',
                    background: item.percentage >= 80
                      ? 'linear-gradient(90deg, #10B981, #059669)'
                      : (item.percentage >= 60 ? 'linear-gradient(90deg, #F59E0B, #D97706)' : 'linear-gradient(90deg, #EF4444, #DC2626)'),
                    borderRadius: '9999px',
                    transition: 'width 0.5s ease'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dynamic Pedagogical Feedback Box */}
      <div style={{
        padding: '12px 16px',
        background: '#EFF6FF',
        borderRadius: '12px',
        border: '1.5px solid #BFDBFE',
        fontSize: '0.88rem',
        color: '#1E40AF',
        fontWeight: 600,
        lineHeight: 1.5
      }}>
        {hasSubmissions && strongest ? (
          <div>
            💡 <strong>Nhận xét giáo viên:</strong> Bé làm tốt nhất ở phần <strong>{strongest.name} ({strongest.percentage}%)</strong>.
            {weakest && weakest.percentage < 80 && (
              <span> Hãy luyện tập thêm phần <strong>{weakest.name} ({weakest.percentage}%)</strong> để đạt điểm 10 tuyệt đối nhé!</span>
            )}
          </div>
        ) : (
          <div>
            💡 <strong>Lời khuyên:</strong> Hãy chọn môn học yêu thích (Toán, Tiếng Việt, Tiếng Anh, Khoa Học) và bắt đầu làm bài luyện tập đầu tiên!
          </div>
        )}
      </div>
    </div>
  );
}
