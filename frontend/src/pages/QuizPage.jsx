import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { sound } from '../services/audio';
import { useDialog } from '../context/DialogContext';
import { useToast } from '../context/ToastContext';

export default function QuizPage({ exerciseId, onFinish, onBack }) {
  const { confirm } = useDialog();
  const { showError } = useToast();
  const [exercise, setExercise] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: 'A' | 'string' | { "1": "B" } }
  const [showHint, setShowHint] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Matching interaction state for current question
  const [selectedLeft, setSelectedLeft] = useState(null);

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
      const q = exercise?.questions[currentIdx];
      if (!q) return;

      if (q.question_type === 'multiple_choice' || !q.question_type) {
        const key = e.key.toUpperCase();
        const numMap = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
        const selected = numMap[key] || (['A', 'B', 'C', 'D'].includes(key) ? key : null);

        if (selected) {
          selectOption(q.id, selected);
        }
      }

      if (e.key === 'ArrowRight' && currentIdx < (exercise.questions.length - 1)) {
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

  const handleFillChange = (qId, value) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: value
    }));
  };

  const handleMatchingClickLeft = (leftId) => {
    sound.pop();
    setSelectedLeft(leftId);
  };

  const handleMatchingClickRight = (qId, rightId) => {
    sound.pop();
    if (!selectedLeft) return;

    // Connect selectedLeft to rightId
    setAnswers(prev => {
      const currentMatching = prev[qId] && typeof prev[qId] === 'object' ? { ...prev[qId] } : {};
      currentMatching[selectedLeft] = rightId;
      return {
        ...prev,
        [qId]: currentMatching
      };
    });

    setSelectedLeft(null);
  };

  const handleRemoveMatchingPair = (qId, leftId) => {
    sound.pop();
    setAnswers(prev => {
      const currentMatching = prev[qId] && typeof prev[qId] === 'object' ? { ...prev[qId] } : {};
      delete currentMatching[leftId];
      return {
        ...prev,
        [qId]: currentMatching
      };
    });
  };

  const nextQuestion = () => {
    sound.pop();
    if (currentIdx < exercise.questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setShowHint(false);
      setSelectedLeft(null);
    }
  };

  const prevQuestion = () => {
    sound.pop();
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
      setShowHint(false);
      setSelectedLeft(null);
    }
  };

  const handleSubmit = async () => {
    const total = exercise.questions.length;
    const answeredCount = Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== '').length;

    if (answeredCount < total) {
      const isConfirmed = await confirm({
        title: 'Nộp Bài Tập Ngay?',
        message: `Bé vẫn còn ${total - answeredCount} câu chưa trả lời. Bé có chắc chắn muốn nộp bài để chấm điểm luôn không?`,
        icon: '📝',
        confirmText: 'Nộp bài luôn 🚀',
        cancelText: 'Làm tiếp ✏️'
      });
      if (!isConfirmed) return;
    }

    setIsSubmitting(true);
    const res = await api.submitExercise(exercise.id, answers, secondsElapsed);
    setIsSubmitting(false);

    if (res.success && res.result) {
      onFinish(res.result);
    } else {
      showError('Lỗi nộp bài', res.message || 'Không thể chấm điểm lúc này. Vui lòng thử lại!');
    }
  };

  if (loading || !exercise) {
    return (
      <div className="container" style={{ padding: '40px 0', textAlign: 'center' }}>
        <h2>⏳ Đang chuẩn bị đề bài tập...</h2>
      </div>
    );
  }

  const currentQ = exercise.questions[currentIdx] || {};
  const totalQ = exercise.questions.length;
  const progressPct = ((currentIdx + 1) / totalQ) * 100;
  const mins = Math.floor(secondsElapsed / 60);
  const secs = secondsElapsed % 60;
  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const qType = currentQ.question_type || 'multiple_choice';

  const pairColors = ['#4F46E5', '#059669', '#D97706', '#DB2777', '#7C3AED'];

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
        {/* Type & Index Badges */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            fontWeight: 800,
            fontSize: '0.95rem'
          }}>
            <span>❓ Câu hỏi {currentIdx + 1} / {totalQ}</span>
          </div>

          <div style={{
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 800,
            background: qType === 'fill_blank' ? '#ECFDF5' : (qType === 'matching' ? '#FFFBEB' : (qType === 'true_false' ? '#F5F3FF' : '#EEF2FF')),
            color: qType === 'fill_blank' ? '#065F46' : (qType === 'matching' ? '#92400E' : (qType === 'true_false' ? '#5B21B6' : '#3730A3')),
            border: '1px solid currentColor'
          }}>
            {qType === 'fill_blank' ? '✏️ Điền Từ / Điền Số' : (qType === 'matching' ? '🔗 Nối Cặp Tương Ứng' : (qType === 'true_false' ? '✅ Đúng hay Sai' : '🎯 Trắc Nghiệm'))}
          </div>
        </div>

        {/* Question Statement */}
        <h3 style={{ fontSize: '1.45rem', fontWeight: 800, lineHeight: 1.5, marginBottom: currentQ.image_url ? '16px' : '24px', color: '#1E293B' }}>
          {currentQ.question_text}
        </h3>

        {/* Question Image Attachment (if present) */}
        {currentQ.image_url && (
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <img
              src={currentQ.image_url}
              alt="Hình minh họa câu hỏi"
              style={{
                maxWidth: '100%',
                maxHeight: '260px',
                borderRadius: '16px',
                border: '2px solid #E2E8F0',
                boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                objectFit: 'contain'
              }}
            />
          </div>
        )}

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
              <span>💡 {showHint ? 'Ẩn gợi ý' : 'Bé cần gợi ý của cô giáo không?'}</span>
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

        {/* ========================================================================= */}
        {/* TYPE 1: MULTIPLE CHOICE (4 Options) */}
        {/* ========================================================================= */}
        {(qType === 'multiple_choice' || !qType) && currentQ.options && (
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
        )}

        {/* ========================================================================= */}
        {/* TYPE 2: FILL IN THE BLANK / NUMBER */}
        {/* ========================================================================= */}
        {qType === 'fill_blank' && (
          <div style={{ marginBottom: '32px', background: '#F8FAFC', padding: '24px', borderRadius: '18px', border: '2px solid #E2E8F0' }}>
            <label style={{ display: 'block', fontWeight: 800, fontSize: '1rem', color: '#1E293B', marginBottom: '10px' }}>
              👉 Bé hãy nhập câu trả lời hoặc số vào ô bên dưới:
            </label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={answers[currentQ.id] || ''}
                onChange={e => handleFillChange(currentQ.id, e.target.value)}
                placeholder="Nhập câu trả lời tại đây..."
                autoFocus
                style={{
                  flex: 1,
                  minWidth: '240px',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  border: '2.5px solid #059669',
                  background: 'white',
                  fontWeight: 900,
                  fontSize: '1.35rem',
                  color: '#065F46',
                  outline: 'none',
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.15)'
                }}
              />
              {answers[currentQ.id] && (
                <button
                  type="button"
                  onClick={() => handleFillChange(currentQ.id, '')}
                  style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', padding: '12px 18px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
                >
                  ✕ Xóa
                </button>
              )}
            </div>

            {/* Quick Math Keypad Helper */}
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748B' }}>Bàn phím nhanh:</span>
              {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', 'cm', 'kg'].map(sym => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => handleFillChange(currentQ.id, (answers[currentQ.id] || '') + sym)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    background: 'white',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TYPE 3: TRUE / FALSE */}
        {/* ========================================================================= */}
        {qType === 'true_false' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
            <div
              onClick={() => selectOption(currentQ.id, 'Đúng')}
              style={{
                background: answers[currentQ.id] === 'Đúng' ? '#D1FAE5' : '#F8FAFC',
                border: answers[currentQ.id] === 'Đúng' ? '3px solid #059669' : '2px solid #E2E8F0',
                borderRadius: '20px',
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: answers[currentQ.id] === 'Đúng' ? '0 8px 24px rgba(5, 150, 105, 0.25)' : 'none',
                transform: answers[currentQ.id] === 'Đúng' ? 'scale(1.03)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '8px' }}>👍</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#065F46' }}>ĐÚNG</div>
              <div style={{ fontSize: '0.85rem', color: '#047857', fontWeight: 700, marginTop: '4px' }}>Khẳng định trên là chính xác</div>
            </div>

            <div
              onClick={() => selectOption(currentQ.id, 'Sai')}
              style={{
                background: answers[currentQ.id] === 'Sai' ? '#FEE2E2' : '#F8FAFC',
                border: answers[currentQ.id] === 'Sai' ? '3px solid #DC2626' : '2px solid #E2E8F0',
                borderRadius: '20px',
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: answers[currentQ.id] === 'Sai' ? '0 8px 24px rgba(220, 38, 38, 0.25)' : 'none',
                transform: answers[currentQ.id] === 'Sai' ? 'scale(1.03)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '8px' }}>👎</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#991B1B' }}>SAI</div>
              <div style={{ fontSize: '0.85rem', color: '#B91C1C', fontWeight: 700, marginTop: '4px' }}>Khẳng định trên là chưa đúng</div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TYPE 4: MATCHING (2-Column Pair Connect) */}
        {/* ========================================================================= */}
        {qType === 'matching' && currentQ.matching_data && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              background: '#FFFBEB',
              border: '1.5px solid #FDE68A',
              padding: '12px 18px',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: 800,
              color: '#92400E',
              marginBottom: '16px'
            }}>
              👉 Hướng dẫn: Bấm chọn 1 mục ở <strong>Cột Trái</strong>, sau đó bấm vào mục tương ứng ở <strong>Cột Phải</strong> để nối cặp!
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Left Column */}
              <div>
                <h4 style={{ fontWeight: 900, color: '#475569', marginBottom: '12px', textAlign: 'center' }}>CỘT A</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {currentQ.matching_data.left.map((item, idx) => {
                    const matchedRightId = answers[currentQ.id]?.[item.id];
                    const isLeftSelected = selectedLeft === item.id;
                    const color = matchedRightId ? pairColors[idx % pairColors.length] : '#4F46E5';

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleMatchingClickLeft(item.id)}
                        style={{
                          padding: '14px 18px',
                          borderRadius: '14px',
                          border: isLeftSelected ? '2.5px solid #D97706' : (matchedRightId ? `2px solid ${color}` : '2px solid #E2E8F0'),
                          background: isLeftSelected ? '#FEF3C7' : (matchedRightId ? `${color}15` : '#F8FAFC'),
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontWeight: 800,
                          fontSize: '1.05rem',
                          transition: 'all 0.2s ease',
                          transform: isLeftSelected ? 'scale(1.02)' : 'none'
                        }}
                      >
                        <span>{item.text}</span>
                        {matchedRightId ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ background: color, color: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 900 }}>
                              ➔ {currentQ.matching_data.right.find(r => r.id === matchedRightId)?.text || matchedRightId}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleRemoveMatchingPair(currentQ.id, item.id); }}
                              style={{ background: '#FEE2E2', border: 'none', color: '#EF4444', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontWeight: 900 }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>Chọn nối ➔</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column */}
              <div>
                <h4 style={{ fontWeight: 900, color: '#475569', marginBottom: '12px', textAlign: 'center' }}>CỘT B</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {currentQ.matching_data.right.map((item) => {
                    const connectedLeftKey = answers[currentQ.id] ? Object.keys(answers[currentQ.id]).find(k => answers[currentQ.id][k] === item.id) : null;
                    const color = connectedLeftKey ? pairColors[(parseInt(connectedLeftKey, 10) - 1) % pairColors.length] || '#059669' : '#059669';

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleMatchingClickRight(currentQ.id, item.id)}
                        style={{
                          padding: '14px 18px',
                          borderRadius: '14px',
                          border: connectedLeftKey ? `2px solid ${color}` : (selectedLeft ? '2px dashed #D97706' : '2px solid #E2E8F0'),
                          background: connectedLeftKey ? `${color}15` : (selectedLeft ? '#FFFBEB' : '#F8FAFC'),
                          cursor: selectedLeft ? 'pointer' : 'default',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontWeight: 800,
                          fontSize: '1.05rem',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span>{item.text}</span>
                        {connectedLeftKey && (
                          <span style={{ background: color, color: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 900 }}>
                            ✅ Đã nối
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
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
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)', padding: '12px 28px' }}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? '⏳ Đang chấm bài...' : 'Nộp Bài Chấm Điểm 🎉'}</span>
            </button>
          ) : (
            <button className="btn-primary" onClick={nextQuestion} style={{ padding: '12px 24px' }}>
              <span>Câu Tiếp Theo ▶️</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
