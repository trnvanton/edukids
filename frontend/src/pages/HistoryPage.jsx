import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { sound } from '../services/audio';
import { useAuth } from '../context/AuthContext';

export default function HistoryPage({ onRetakeExercise, onGoToSubjects }) {
  const { user, getAvatarEmoji } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null); // Modal view
  const [filterSubject, setFilterSubject] = useState('all');

  useEffect(() => {
    loadHistory();
  }, [user]);

  const loadHistory = () => {
    try {
      const allSubs = api.getRealSubmissions();
      const currentUserName = (user?.full_name || user?.username || '').toLowerCase();
      const curUserId = String(user?.id);

      const mySubs = allSubs.filter(s => {
        const sName = (s.student_name || s.user_name || s.username || '').toLowerCase();
        const sId = String(s.user_id);
        return sId === curUserId || sName === currentUserName || !user;
      });

      setSubmissions(mySubs);
    } catch (e) {
      setSubmissions([]);
    }
  };

  const getScoreBadge = (score10, percentage) => {
    const val = score10 !== undefined ? score10 : Math.round(percentage / 10);
    if (val >= 9) return { bg: '#DEF7EC', text: '#03543F', label: 'Xuất Sắc 🌟', icon: '👑' };
    if (val >= 7) return { bg: '#E1EFFE', text: '#1E429F', label: 'Đạt Chuẩn 👏', icon: '⭐' };
    if (val >= 5) return { bg: '#FEF08A', text: '#713F12', label: 'Cần Cố Gắng 💪', icon: '🐥' };
    return { bg: '#FDE8E8', text: '#9B1C1C', label: 'Ôn Lại Bài ⚠️', icon: '📝' };
  };

  return (
    <div className="container" style={{ padding: '28px 0 60px 0' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        borderRadius: '20px',
        padding: '24px 28px',
        color: 'white',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.3)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.8rem' }}>📜</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>
              Lịch Sử Làm Bài & Xem Lại Bài Đã Học
            </h2>
          </div>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>
            Xem lại chi tiết từng câu hỏi, lời giải của giáo viên và đối chiếu đáp án để khắc sâu kiến thức!
          </p>
        </div>

        <button
          className="btn-secondary"
          onClick={() => { sound.pop(); onGoToSubjects(); }}
          style={{ background: 'white', color: '#4F46E5', fontWeight: 800, border: 'none' }}
        >
          <span>📚 Luyện Bài Tập Mới</span>
        </button>
      </div>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <span style={{ fontSize: '3.5rem' }}>📝</span>
          <h3 style={{ marginTop: '16px', fontWeight: 800 }}>Bé chưa hoàn thành bài tập nào!</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            Hãy bắt đầu làm bài luyện tập đầu tiên để ghi lại lịch sử điểm số và nhận huy hiệu nhé!
          </p>
          <button className="btn-primary" onClick={() => { sound.pop(); onGoToSubjects(); }}>
            <span>🚀 Bắt Đầu Học Ngay</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {submissions.map((sub, idx) => {
            const badge = getScoreBadge(sub.score10, sub.percentage);
            const questions = sub.questions || sub.questionBreakdown || sub.feedback || [];
            const hasDetailedQuestions = questions.length > 0;

            return (
              <div
                key={sub.id || idx}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 22px',
                  flexWrap: 'wrap',
                  gap: '16px',
                  transition: 'all 0.2s ease',
                  border: '1.5px solid #E2E8F0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '260px' }}>
                  <div style={{
                    fontSize: '2rem',
                    background: '#EEF2FF',
                    width: '54px',
                    height: '54px',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid #C7D2FE'
                  }}>
                    {badge.icon}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                        {sub.exercise_title || 'Bài luyện tập tổng hợp'}
                      </h4>
                      <span style={{
                        background: badge.bg,
                        color: badge.text,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 800
                      }}>
                        {badge.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span>📅 {sub.submittedAt || 'Gần đây'}</span>
                      <span>⏱️ {sub.timeTakenSeconds || 30} giây</span>
                      <span>⭐ +{sub.xpEarned || 30} XP</span>
                      {sub.class_name && <span>🏫 {sub.class_name}</span>}
                    </div>
                  </div>
                </div>

                {/* Score & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right', minWidth: '90px' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)' }}>
                      {sub.score10 !== undefined ? `${sub.score10}/10` : `${sub.percentage || 0}%`}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                      Đúng {sub.correctCount || 0} / {sub.totalQuestions || 10} câu
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {hasDetailedQuestions && (
                      <button
                        className="btn-secondary"
                        onClick={() => { sound.pop(); setSelectedSub(sub); }}
                        style={{ padding: '8px 14px', fontSize: '0.88rem', fontWeight: 800, background: '#EEF2FF', color: 'var(--primary)', border: '1px solid #C7D2FE' }}
                      >
                        <span>🔍 Xem Lại Chi Tiết</span>
                      </button>
                    )}

                    <button
                      className="btn-primary"
                      onClick={() => {
                        sound.pop();
                        onRetakeExercise(sub.exercise_id);
                      }}
                      style={{ padding: '8px 14px', fontSize: '0.88rem', fontWeight: 800 }}
                    >
                      <span>🔄 Làm Lại</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Review Modal */}
      {selectedSub && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '850px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1.5px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#F8FAFC'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>
                  🔍 Chi Tiết Bài Làm: {selectedSub.exercise_title}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Điểm số: <strong>{selectedSub.score10}/10</strong> ({selectedSub.percentage}%) • Đúng {selectedSub.correctCount}/{selectedSub.totalQuestions} câu • Ngày làm: {selectedSub.submittedAt}
                </p>
              </div>

              <button
                onClick={() => setSelectedSub(null)}
                style={{
                  background: '#E2E8F0',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  fontWeight: 900,
                  fontSize: '1.1rem'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Questions Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {(selectedSub.questions || selectedSub.questionBreakdown || selectedSub.feedback || []).map((q, idx) => (
                <div
                  key={idx}
                  style={{
                    borderRadius: '16px',
                    border: q.isCorrect ? '2px solid #86EFAC' : '2px solid #FCA5A5',
                    background: q.isCorrect ? '#F0FDF4' : '#FEF2F2',
                    padding: '18px 20px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 900, fontSize: '0.95rem', color: q.isCorrect ? '#166534' : '#991B1B' }}>
                      Câu {q.index || idx + 1}: {q.isCorrect ? '✅ Trả lời ĐÚNG (+10 điểm)' : '❌ Trả lời SAI (0 điểm)'}
                    </span>
                    <span style={{
                      background: q.isCorrect ? '#DCFCE7' : '#FEE2E2',
                      color: q.isCorrect ? '#15803D' : '#B91C1C',
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.78rem',
                      fontWeight: 800
                    }}>
                      {q.questionType === 'multiple_select' ? 'Chọn nhiều đáp án' : (q.questionType === 'fill_blank' ? 'Điền ô' : 'Trắc nghiệm')}
                    </span>
                  </div>

                  <p style={{ fontSize: '1.02rem', fontWeight: 700, color: '#1E293B', marginBottom: '12px', lineHeight: 1.4 }}>
                    {q.questionText}
                  </p>

                  {q.imageUrl && (
                    <div style={{ marginBottom: '12px' }}>
                      <img
                        src={q.imageUrl}
                        alt="Minh họa"
                        style={{ maxHeight: '140px', borderRadius: '10px', border: '1px solid #CBD5E1' }}
                      />
                    </div>
                  )}

                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    border: '1px solid rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '0.9rem'
                  }}>
                    <div>
                      <strong style={{ color: '#475569' }}>Lựa chọn của bé: </strong>
                      <span style={{ fontWeight: 800, color: q.isCorrect ? '#16A34A' : '#DC2626' }}>
                        {q.studentAnswer || q.userAnswer || 'Chưa trả lời'}
                      </span>
                    </div>

                    <div>
                      <strong style={{ color: '#475569' }}>Đáp án chính xác: </strong>
                      <span style={{ fontWeight: 800, color: '#2563EB' }}>
                        {q.correctAnswer}
                      </span>
                    </div>

                    {(q.pedagogicalExplanation || q.explanation) && (
                      <div style={{
                        marginTop: '8px',
                        paddingTop: '8px',
                        borderTop: '1px dashed #E2E8F0',
                        color: '#4338CA',
                        fontSize: '0.88rem',
                        lineHeight: 1.45
                      }}>
                        💡 <strong>Lời giải của cô giáo: </strong> {q.pedagogicalExplanation || q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1.5px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              background: '#F8FAFC'
            }}>
              <button
                className="btn-secondary"
                onClick={() => setSelectedSub(null)}
              >
                Đóng
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  sound.pop();
                  const targetId = selectedSub.exercise_id;
                  setSelectedSub(null);
                  onRetakeExercise(targetId);
                }}
              >
                <span>🔄 Làm Lại Bài Này Ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
