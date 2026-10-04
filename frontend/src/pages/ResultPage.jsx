import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { sound } from '../services/audio';

export default function ResultPage({ result, onRetake, onGoToLeaderboard, onBackToSubjects }) {
  const { addXp } = useAuth();

  useEffect(() => {
    if (!result) return;

    // Add XP to user profile state
    if (result.xpEarned) {
      addXp(result.xpEarned);
    }

    // Trigger celebration sounds & Confetti
    if (result.scorePercentage >= 80) {
      sound.fanfare();
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else if (result.scorePercentage >= 50) {
      sound.correct();
    } else {
      sound.wrong();
    }
  }, [result]);

  if (!result) return null;

  const {
    score10,
    scorePercentage,
    totalQuestions,
    correctCount,
    wrongCount,
    xpEarned,
    maxCombo,
    timeTakenSeconds,
    overallMessage,
    questionBreakdown
  } = result;

  const mins = Math.floor(timeTakenSeconds / 60);
  const secs = timeTakenSeconds % 60;

  return (
    <div className="container" style={{ padding: '24px 0 60px 0' }}>
      {/* Hero Summary Card */}
      <div className="card" style={{ textAlign: 'center', padding: '36px 20px', marginBottom: '30px' }}>
        <div style={{ fontSize: '4.8rem', marginBottom: '12px' }}>
          {scorePercentage >= 80 ? '🥳' : (scorePercentage >= 50 ? '😊' : '🤗')}
        </div>

        <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '8px' }}>
          {overallMessage.title}
        </h2>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 700, maxWidth: '600px', margin: '0 auto 24px auto' }}>
          {overallMessage.sub}
        </p>

        {/* Score Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '14px',
          maxWidth: '650px',
          margin: '0 auto 28px auto'
        }}>
          <div style={{ background: '#FEF3C7', padding: '16px', borderRadius: 'var(--radius-md)', border: '2px solid #FDE68A' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#B45309' }}>{score10}/10</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#92400E', textTransform: 'uppercase' }}>Điểm Số</div>
          </div>

          <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: 'var(--radius-md)', border: '2px solid var(--border-color)' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>{correctCount}/{totalQuestions}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Câu Đúng</div>
          </div>

          <div style={{ background: '#FEF3C7', padding: '16px', borderRadius: 'var(--radius-md)', border: '2px solid #FDE68A' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#B45309' }}>+{xpEarned} ⭐</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#92400E', textTransform: 'uppercase' }}>XP Nhận Được</div>
          </div>

          <div style={{ background: '#FFE4E6', padding: '16px', borderRadius: 'var(--radius-md)', border: '2px solid #FECDD3' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#E11D48' }}>🔥 {maxCombo}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#9F1239', textTransform: 'uppercase' }}>Combo Đỉnh Nhất</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => { sound.pop(); onRetake(); }}>
            <span>🔄 Làm Lại Bài Này</span>
          </button>
          <button className="btn-secondary" onClick={() => { sound.pop(); onGoToLeaderboard(); }}>
            <span>🏆 Xem Bảng Vàng</span>
          </button>
          <button className="btn-secondary" onClick={() => { sound.pop(); onBackToSubjects(); }}>
            <span>📚 Chọn Bài Khác</span>
          </button>
        </div>
      </div>

      {/* Detailed Question Review & Step-by-Step Pedagogical Explanations */}
      <div>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📖</span>
          <span>Xem Lại Bài Làm & Lời Giải Thích Chi Tiết Từng Bước:</span>
        </h3>

        {questionBreakdown.map((q, idx) => (
          <div
            key={q.questionId}
            className="card"
            style={{
              marginBottom: '18px',
              borderColor: q.isCorrect ? '#A7F3D0' : '#FECDD3',
              background: q.isCorrect ? '#FCFDFD' : '#FFFDFD'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: 800, color: 'var(--text-muted)' }}>Câu hỏi {idx + 1}</span>
              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  background: q.isCorrect ? '#D1FAE5' : '#FEE2E2',
                  color: q.isCorrect ? '#065F46' : '#991B1B'
                }}
              >
                {q.isCorrect ? '✅ Bé trả lời chính xác (+5 XP)' : '❌ Chưa chính xác'}
              </span>
            </div>

            <div style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>
              {q.questionText}
            </div>

            {/* Answer Comparison */}
            <div style={{
              background: '#F8FAFC',
              padding: '14px 18px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ color: q.isCorrect ? '#059669' : '#DC2626', fontWeight: 800 }}>
                👉 Lựa chọn của bé: <strong>{q.userAnswer ? `[Đáp án ${q.userAnswer}]` : 'Chưa trả lời'}</strong>
              </div>
              {!q.isCorrect && (
                <div style={{ color: '#059669', fontWeight: 800 }}>
                  🎯 Đáp án chính xác: <strong>[Đáp án {q.correctAnswer}] - {q.correctAnswerText}</strong>
                </div>
              )}
            </div>

            {/* Detailed Explanation Callout */}
            <div style={{
              background: '#FFFBEB',
              border: '2px solid #FDE68A',
              borderRadius: 'var(--radius-md)',
              padding: '16px 18px'
            }}>
              <div style={{ color: '#B45309', fontWeight: 900, fontSize: '1rem', marginBottom: '6px' }}>
                💡 Lời giải thích chi tiết của cô giáo:
              </div>
              <div style={{ color: '#78350F', fontWeight: 600, fontSize: '0.98rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {q.explanation}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
