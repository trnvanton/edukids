import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { sound } from '../services/audio';

export default function QuizPage({ exerciseId, onFinish, onBack }) {
  const [exercise, setExercise] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: 'A' }
  const [showHint, setShowHint] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExercise();
  }, [exerciseId]);

  // Timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard navigation & option selection
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();
      const numMap = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
      const selected = numMap[key] || (['A', 'B', 'C', 'D'].includes(key) ? key : null);

      if (selected && exercise?.questions[currentIdx]) {
        selectOption(exercise.questions[currentIdx].id, selected);
      } else if (e.key === 'ArrowRight' && currentIdx < (exercise?.questions.length - 1)) {
        nextQuestion();
      } else if (e.key === 'ArrowLeft' && currentIdx > 0) {
        prevQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [exercise, currentIdx]);

  const loadExercise = async () => {
    setLoading(true);
    const res = await api.getExercise(exerciseId);
    if (res.success && res.exercise) {
      setExercise(res.exercise);
    }
    setLoading(false);
  };

  const selectOption = (qId, optionLabel) => {
    sound.pop();
    setAnswers(prev => ({
      ...prev,
      [qId]: optionLabel
    }));
  };

  const nextQuestion = () => {
    sound.pop();
    if (currentIdx < exercise.questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setShowHint(false);
    }
  };

  const prevQuestion = () => {
    sound.pop();
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
      setShowHint(false);
    }
  };

  const handleSubmit = async () => {
    const total = exercise.questions.length;
    const answeredCount = Object.keys(answers).length;

    if (answeredCount < total) {
      const confirm = window.confirm(`Bé còn ${total - answeredCount} câu chưa làm. Bé có muốn nộp bài luôn không?`);
      if (!confirm) return;
    }

    setIsSubmitting(true);
    const res = await api.submitExercise(exercise.id, answers, secondsElapsed);
    setIsSubmitting(false);

    if (res.success && res.result) {
      onFinish(res.result);
    } else {
      alert('Có lỗi khi nộp bài: ' + (res.message || 'Thử lại'));
    }
  };

  if (loading || !exercise) {
    return (
      <div className="container" style={{ padding: '40px 0', textAlign: 'center' }}>
        <h2>⏳ Đang chuẩn bị đề bài tập...</h2>
      </div>
    );
  }

  const currentQ = exercise.questions[currentIdx];
  const totalQ = exercise.questions.length;
  const progressPct = ((currentIdx + 1) / totalQ) * 100;
  const mins = Math.floor(secondsElapsed / 60);
  const secs = secondsElapsed % 60;
  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="container" style={{ padding: '24px 0 60px 0' }}>
      {/* Quiz Top Bar */}
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--card-shadow)',
        border: '2px solid var(--border-color)',
        marginBottom: '24px',
        gap: '15px',
        flexWrap: 'wrap'
      }}>
        <button className="btn-secondary" onClick={() => { sound.pop(); onBack(); }}>
          <span>◀️ Quay Lại</span>
        </button>

        <div style={{ flex: 1, minWidth: '220px', margin: '0 10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px' }}>
            <span>{exercise.title}</span>
            <span>Câu <strong>{currentIdx + 1}</strong> / {totalQ}</span>
          </div>
          <div className="progress-track" style={{ height: '12px' }}>
            <div className="progress-fill" style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #10B981, #3B82F6)' }} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="chip" style={{ background: '#FEF3C7', color: '#B45309', border: '1.5px solid #FDE68A' }}>
            <span>⏱️</span>
            <span>{formattedTime}</span>
          </div>
          <div className="chip chip-xp">
            <span>⭐</span>
            <span>+{exercise.reward_xp} XP</span>
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="card" style={{ padding: '36px', position: 'relative' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--primary-light)',
          color: 'var(--primary)',
          padding: '6px 16px',
          borderRadius: 'var(--radius-full)',
          fontWeight: 800,
          fontSize: '0.95rem',
          marginBottom: '18px'
        }}>
          <span>❓ Câu hỏi {currentIdx + 1} / {totalQ}</span>
        </div>

        <h3 style={{ fontSize: '1.45rem', fontWeight: 800, lineHeight: 1.5, marginBottom: '24px' }}>
          {currentQ.question_text}
        </h3>

        {/* Hint Drawer */}
        {currentQ.hint && (
          <div style={{ marginBottom: '22px' }}>
            <button
              onClick={() => { sound.pop(); setShowHint(!showHint); }}
              style={{
                background: '#FEF3C7',
                border: 'none',
                color: '#D97706',
                fontWeight: 800,
                fontSize: '0.9rem',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer'
              }}
            >
              <span>💡 {showHint ? 'Ẩn gợi ý' : 'Bé cần gợi ý không?'}</span>
            </button>

            {showHint && (
              <div style={{
                marginTop: '10px',
                background: '#FFFBEB',
                borderLeft: '4px solid #F59E0B',
                padding: '12px 16px',
                borderRadius: '0 8px 8px 0',
                color: '#92400E',
                fontWeight: 700,
                fontSize: '0.95rem'
              }}>
                💡 Gợi ý từ cô giáo: {currentQ.hint}
              </div>
            )}
          </div>
        )}

        {/* Options Grid (A, B, C, D) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '32px' }}>
          {currentQ.options.map(opt => {
            const isSelected = answers[currentQ.id] === opt.option_label;
            return (
              <div
                key={opt.option_label}
                onClick={() => selectOption(currentQ.id, opt.option_label)}
                style={{
                  background: isSelected ? '#EEF2FF' : '#F8FAFC',
                  border: isSelected ? '2.5px solid var(--primary)' : '2px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 4px 14px rgba(79, 70, 229, 0.2)' : 'none',
                  transform: isSelected ? 'translateY(-2px)' : 'none',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: isSelected ? 'var(--primary)' : 'white',
                  color: isSelected ? 'white' : 'var(--text-main)',
                  border: isSelected ? 'none' : '2px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                  flexShrink: 0
                }}>
                  {opt.option_label}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                  {opt.answer_text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            className="btn-secondary"
            onClick={prevQuestion}
            style={{ visibility: currentIdx > 0 ? 'visible' : 'hidden' }}
          >
            <span>◀️ Câu Trước</span>
          </button>

          {currentIdx === totalQ - 1 ? (
            <button
              className="btn-primary"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? '⏳ Đang chấm bài...' : 'Nộp Bài Chấm Điểm 🎉'}</span>
            </button>
          ) : (
            <button className="btn-primary" onClick={nextQuestion}>
              <span>Câu Tiếp Theo ▶️</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
