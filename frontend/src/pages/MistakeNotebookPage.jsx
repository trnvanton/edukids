import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { sound } from '../services/audio';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function MistakeNotebookPage({ onStartMistakeQuiz, onGoToSubjects }) {
  const { user } = useAuth();
  const { showSuccess } = useToast();
  const [mistakes, setMistakes] = useState([]);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadMistakes();
  }, [user]);

  const loadMistakes = () => {
    try {
      const storedMistakes = api.getStudentMistakes(user);
      setMistakes(storedMistakes);
    } catch (e) {
      setMistakes([]);
    }
  };

  const handleResolveSingle = (mistakeId) => {
    sound.correct();
    api.resolveStudentMistake(mistakeId, user);
    showSuccess('Chúc mừng bé!', 'Đã đánh dấu nắm vững câu hỏi này! 🎉');
    loadMistakes();
  };

  const handleClearAllResolved = () => {
    sound.pop();
    api.clearResolvedMistakes(user);
    loadMistakes();
  };

  const activeMistakes = mistakes.filter(m => !m.resolved);
  const resolvedMistakes = mistakes.filter(m => m.resolved);

  const displayedList = filterType === 'active' 
    ? activeMistakes 
    : (filterType === 'resolved' ? resolvedMistakes : mistakes);

  return (
    <div className="container" style={{ padding: '28px 0 60px 0' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #DC2626 0%, #EA580C 100%)',
        borderRadius: '20px',
        padding: '26px 30px',
        color: 'white',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 10px 25px -5px rgba(220, 38, 38, 0.3)'
      }}>
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '2.2rem' }}>🎯</span>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0 }}>
                Hệ Thống "Sai Ở Đâu – Học Lại Ở Đó"
              </h2>
              <span style={{ fontSize: '0.85rem', background: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: '9999px', fontWeight: 800 }}>
                Sổ Tay Lỗi Sai Thông Minh EduKids
              </span>
            </div>
          </div>
          <p style={{ margin: 0, opacity: 0.95, fontSize: '0.96rem', lineHeight: 1.5 }}>
            Hệ thống tự động ghi nhớ các câu bé từng làm sai hoặc chưa chắc chắn. Luyện tập lại để biến điểm yếu thành điểm mạnh nhé!
          </p>
        </div>

        {activeMistakes.length > 0 ? (
          <button
            className="btn-primary"
            onClick={() => {
              sound.fanfare();
              onStartMistakeQuiz();
            }}
            style={{
              background: '#FFFFFF',
              color: '#DC2626',
              fontSize: '1.05rem',
              fontWeight: 900,
              padding: '14px 24px',
              border: 'none',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
              transform: 'scale(1.03)'
            }}
          >
            <span>🔥 Ôn Luyện {activeMistakes.length} Câu Sai Ngay</span>
          </button>
        ) : (
          <button
            className="btn-secondary"
            onClick={() => { sound.pop(); onGoToSubjects(); }}
            style={{ background: 'white', color: '#EA580C', fontWeight: 800, border: 'none' }}
          >
            <span>📚 Làm Bài Mới Để Thử Thách</span>
          </button>
        )}
      </div>

      {/* Filter Tabs & Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => { sound.pop(); setFilterType('all'); }}
            className={`nav-btn ${filterType === 'all' ? 'active' : ''}`}
            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
          >
            Tất cả ({mistakes.length})
          </button>
          <button
            onClick={() => { sound.pop(); setFilterType('active'); }}
            className={`nav-btn ${filterType === 'active' ? 'active' : ''}`}
            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
          >
            ⚠️ Cần ôn tập ({activeMistakes.length})
          </button>
          <button
            onClick={() => { sound.pop(); setFilterType('resolved'); }}
            className={`nav-btn ${filterType === 'resolved' ? 'active' : ''}`}
            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
          >
            ✅ Đã nắm vững ({resolvedMistakes.length})
          </button>
        </div>

        {resolvedMistakes.length > 0 && (
          <button
            onClick={handleClearAllResolved}
            style={{
              background: 'transparent',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.82rem',
              color: '#64748B',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            🧹 Dọn bớt các câu đã nắm vững
          </button>
        )}
      </div>

      {/* Mistake Cards List */}
      {displayedList.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <span style={{ fontSize: '3.8rem' }}>🎉</span>
          <h3 style={{ marginTop: '16px', fontWeight: 900, color: '#166534' }}>
            {filterType === 'active' ? 'Tuyệt vời! Bé không còn câu sai nào cần ôn tập!' : 'Chưa có câu hỏi sai nào trong sổ tay!'}
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', maxWidth: '500px', margin: '0 auto 20px auto' }}>
            Bé đang làm bài rất tốt và nắm vững toàn bộ kiến thức. Tiếp tục phát huy ở các bài tập tiếp theo nhé!
          </p>
          <button className="btn-primary" onClick={() => { sound.pop(); onGoToSubjects(); }}>
            <span>🚀 Khám Phá Bài Học Mới</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {displayedList.map((m, idx) => (
            <div
              key={m.id || idx}
              className="card"
              style={{
                borderRadius: '16px',
                border: m.resolved ? '1.5px solid #86EFAC' : '2px solid #FCA5A5',
                background: m.resolved ? '#F0FDF4' : '#FFFFFF',
                padding: '20px 24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
              }}
            >
              {/* Card Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    background: m.resolved ? '#DCFCE7' : '#FEE2E2',
                    color: m.resolved ? '#15803D' : '#B91C1C',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 900
                  }}>
                    {m.resolved ? '✅ ĐÃ NẮM VỮNG' : '⚠️ CẦN ÔN TẬP'}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 800 }}>
                    Từ bài: <strong>{m.exercise_title || 'Bài tập rèn luyện'}</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {!m.resolved ? (
                    <button
                      onClick={() => handleResolveSingle(m.id)}
                      style={{
                        background: '#DCFCE7',
                        color: '#15803D',
                        border: '1px solid #86EFAC',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      ✓ Đã Hiểu Rõ Lời Giải
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.82rem', color: '#16A34A', fontWeight: 800 }}>
                      🎉 Đã khắc phục thành công!
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <h4 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#1E293B', marginBottom: '12px', lineHeight: 1.45 }}>
                {m.question_text || m.questionText}
              </h4>

              {m.image_url && (
                <div style={{ marginBottom: '14px' }}>
                  <img
                    src={m.image_url}
                    alt="Minh họa"
                    style={{ maxHeight: '160px', borderRadius: '12px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              )}

              {/* Answers Breakdown Box */}
              <div style={{
                background: '#F8FAFC',
                borderRadius: '12px',
                padding: '14px 18px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.92rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <strong style={{ color: '#DC2626', minWidth: '140px' }}>❌ Lần trước bé chọn:</strong>
                  <span style={{ color: '#DC2626', fontWeight: 800 }}>
                    {m.student_answer || m.studentAnswer || 'Chưa chọn'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <strong style={{ color: '#16A34A', minWidth: '140px' }}>✅ Đáp án chuẩn:</strong>
                  <span style={{ color: '#16A34A', fontWeight: 900 }}>
                    {m.correct_answer || m.correctAnswer}
                  </span>
                </div>

                {(m.explanation || m.pedagogicalExplanation || m.hint) && (
                  <div style={{
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px dashed #CBD5E1',
                    color: '#4338CA',
                    fontSize: '0.9rem',
                    lineHeight: 1.5
                  }}>
                    💡 <strong>Phương pháp & Lời giải: </strong> {m.explanation || m.pedagogicalExplanation || m.hint}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
