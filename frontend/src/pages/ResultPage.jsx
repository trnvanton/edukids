import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { sound } from '../services/audio';

export default function ResultPage({ result, onRetake, onGoToLeaderboard, onBackToSubjects }) {
  const { addXp } = useAuth();

  useEffect(() => {
    if (!result) return;

    const xp = result.xpEarned || result.earnedXp || 30;
    addXp(xp);

    const pct = result.scorePercentage !== undefined ? result.scorePercentage : (result.percentage || 80);
    if (pct >= 80) {
      sound.fanfare();
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    } else if (pct >= 50) {
      sound.correct();
    } else {
      sound.wrong();
    }
  }, [result]);

  if (!result) {
    return (
      <div className="container" style={{ padding: '40px 0', textAlign: 'center' }}>
        <h3>⏳ Đang xử lý kết quả bài làm...</h3>
        <button className="btn-primary" onClick={onBackToSubjects} style={{ marginTop: '16px' }}>
          Quay lại danh sách bài tập
        </button>
      </div>
    );
  }

  // Safe property extraction
  const score10 = result.score10 !== undefined ? result.score10 : (result.score !== undefined ? result.score : 10);
  const scorePercentage = result.scorePercentage !== undefined ? result.scorePercentage : (result.percentage || 100);
  const totalQuestions = result.totalQuestions || result.total_questions || (result.questionBreakdown?.length) || (result.feedback?.length) || 1;
  const correctCount = result.correctCount !== undefined ? result.correctCount : (result.correct_count || totalQuestions);
  const wrongCount = result.wrongCount !== undefined ? result.wrongCount : (totalQuestions - correctCount);
  const xpEarned = result.xpEarned || result.earnedXp || 30;
  const maxCombo = result.maxCombo || result.combo_max || 1;

  const titleText = scorePercentage >= 80 ? '🎉 Xuất Sắc! Bé Đạt Điểm Rất Cao!' : (scorePercentage >= 50 ? '👏 Khá Lắm! Bé Cố Gắng Lên Nhé!' : '💪 Đừng Nản Lòng, Cùng Luyện Lại Nhé!');
  const subText = scorePercentage >= 80 ? 'Bé đã nắm rất vững kiến thức bài học này. Tiếp tục phát huy nhé!' : 'Hãy xem lại các câu chưa chính xác và lời giải chi tiết của cô giáo bên dưới nhé!';

  const breakdownList = result.questionBreakdown || (result.feedback || []).map((f, i) => ({
    questionId: f.questionId || i,
    questionText: f.questionText || f.question_text || `Câu hỏi ${i + 1}`,
    userAnswer: f.studentAnswer || f.userAnswer || 'Chưa trả lời',
    correctAnswer: f.correctAnswer || 'A',
    correctAnswerText: f.correctAnswerText || 'Đáp án chính xác',
    isCorrect: f.isCorrect !== undefined ? f.isCorrect : true,
    explanation: f.pedagogicalExplanation || f.explanation || 'Áp dụng công thức và lý thuyết bài học để giải bài toán.'
  }));

  return (
    <div className="container" style={{ padding: '24px 0 60px 0' }}>
      {/* Hero Summary Card */}
      <div className="card" style={{ textAlign: 'center', padding: '36px 20px', marginBottom: '30px' }}>
        <div style={{ fontSize: '4.5rem', marginBottom: '12px' }}>
          {scorePercentage >= 80 ? '🥳' : (scorePercentage >= 50 ? '😊' : '🤗')}
        </div>

        <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '8px', color: '#1E293B' }}>
          {result.overallMessage?.title || titleText}
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', fontWeight: 600, maxWidth: '600px', margin: '0 auto 24px auto' }}>
          {result.overallMessage?.sub || subText}
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

          <div style={{ background: '#ECFDF5', padding: '16px', borderRadius: 'var(--radius-md)', border: '2px solid #A7F3D0' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#065F46' }}>{correctCount}/{totalQuestions}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>Câu Đúng</div>
          </div>

          <div style={{ background: '#EEF2FF', padding: '16px', borderRadius: 'var(--radius-md)', border: '2px solid #C7D2FE' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#4F46E5' }}>+{xpEarned} ⭐</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#3730A3', textTransform: 'uppercase' }}>XP Thưởng</div>
          </div>

          <div style={{ background: '#FFE4E6', padding: '16px', borderRadius: 'var(--radius-md)', border: '2px solid #FECDD3' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#E11D48' }}>🔥 {maxCombo}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#9F1239', textTransform: 'uppercase' }}>Combo</div>
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
            <span>📚 Chọn Bài Học Khác</span>
          </button>
        </div>
      </div>

      {/* Detailed Question Review & Step-by-Step Pedagogical Explanations */}
      <div>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📖</span>
          <span>Xem Lại Bài Làm & Lời Giải Thích Chi Tiết Từng Bước:</span>
        </h3>

        {breakdownList.map((q, idx) => (
          <div
            key={q.questionId || idx}
            className="card"
            style={{
              marginBottom: '18px',
              borderColor: q.isCorrect ? '#A7F3D0' : '#FECDD3',
              background: q.isCorrect ? '#FCFDFD' : '#FFFDFD',
              padding: '24px'
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
                {q.isCorrect ? '✅ Trả lời chính xác (+5 XP)' : '❌ Chưa chính xác'}
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
