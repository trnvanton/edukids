import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { sound } from '../services/audio';
import { sampleRandomQuestions } from '../services/randomPoolService';
import { useDialog } from '../context/DialogContext';
import { useToast } from '../context/ToastContext';

export default function QuizPage({ exerciseId, onFinish, onBack }) {
  const { confirm } = useDialog();
  const { showError } = useToast();
  
  const [rawExercise, setRawExercise] = useState(null);
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: 'A' | 'string' | { "1": "B" } }
  const [showHint, setShowHint] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Random Pool Mode State
  const [isPreQuizPrompt, setIsPreQuizPrompt] = useState(false);
  const [selectedRandomCount, setSelectedRandomCount] = useState(10);

  // Matching interaction state for current question
  const [selectedLeft, setSelectedLeft] = useState(null);

  useEffect(() => {
    loadExercise();
  }, [exerciseId]);

  // Timer interval (only runs when quiz has actively started)
  useEffect(() => {
    if (isPreQuizPrompt || loading || !activeQuestions.length) return;
    const timer = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPreQuizPrompt, loading, activeQuestions.length]);

  // Keyboard navigation & option selection
  useEffect(() => {
    if (isPreQuizPrompt) return;
    const handleKeyDown = (e) => {
      const q = activeQuestions[currentIdx];
      if (!q) return;

      if (q.question_type === 'multiple_choice' || !q.question_type) {
        const key = e.key.toUpperCase();
        const numMap = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
        const selected = numMap[key] || (['A', 'B', 'C', 'D'].includes(key) ? key : null);

        if (selected) {
          selectOption(q.id, selected);
        }
      }

      if (e.key === 'ArrowRight' && currentIdx < (activeQuestions.length - 1)) {
        nextQuestion();
      } else if (e.key === 'ArrowLeft' && currentIdx > 0) {
        prevQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeQuestions, currentIdx, isPreQuizPrompt]);

  const loadExercise = async () => {
    setLoading(true);
    const res = await api.getExercise(exerciseId);
    if (res.success && res.exercise) {
      const ex = res.exercise;
      setRawExercise(ex);

      const safeQuestions = (ex.questions || []).map((q, idx) => ({
        ...q,
        id: (q.id !== undefined && q.id !== null) ? q.id : (idx + 1),
        session_index: idx + 1
      }));

      const poolLength = safeQuestions.length;

      // If the exercise has more than 10 questions, ALWAYS let the student choose how many questions to do
      if (poolLength > 10) {
        setIsPreQuizPrompt(true);
        setSelectedRandomCount(Math.min(10, poolLength));
      } else {
        setActiveQuestions(safeQuestions);
        setIsPreQuizPrompt(false);
      }
    }
    setLoading(false);
  };

  const handleStartRandomQuiz = (count) => {
    try {
      sound.pop();
    } catch (e) {}

    const targetCount = count || selectedRandomCount || 10;
    const questionsPool = (rawExercise && Array.isArray(rawExercise.questions)) ? rawExercise.questions : [];
    
    let sampled = [];
    try {
      sampled = sampleRandomQuestions(questionsPool, {
        count: targetCount,
        shuffleQuestions: rawExercise?.shuffle_questions !== false,
        shuffleOptions: !!rawExercise?.shuffle_options
      });
    } catch (err) {
      console.warn('Sampling error, fallback to raw questions:', err);
      sampled = questionsPool.slice(0, targetCount);
    }

    const finalQuestions = (sampled && sampled.length > 0) ? sampled : questionsPool;
    const normalized = finalQuestions.map((q, idx) => ({
      ...q,
      id: (q.id !== undefined && q.id !== null) ? q.id : (idx + 1),
      session_index: idx + 1
    }));

    setActiveQuestions(normalized);
    setCurrentIdx(0);
    setAnswers({});
    setSecondsElapsed(0);
    setIsPreQuizPrompt(false);
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
    if (currentIdx < activeQuestions.length - 1) {
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
    const total = activeQuestions.length;
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
    // Grade precisely against the randomized active subset of questions
    const res = await api.submitExercise(rawExercise.id, answers, secondsElapsed, activeQuestions);
    setIsSubmitting(false);

    if (res.success && res.result) {
      onFinish(res.result);
    } else {
      showError('Lỗi nộp bài', res.message || 'Không thể chấm điểm lúc này. Vui lòng thử lại!');
    }
  };

  if (loading || !rawExercise) {
    return (
      <div className="container" style={{ padding: '40px 0', textAlign: 'center' }}>
        <h2>⏳ Đang chuẩn bị đề bài tập...</h2>
      </div>
    );
  }

  // ================= PRE-QUIZ RANDOM SELECTION SCREEN =================
  if (isPreQuizPrompt) {
    const poolSize = rawExercise.questions?.length || 0;
    const presets = [10, 20, 30, 50, poolSize].filter((cnt, idx, arr) => cnt <= poolSize && arr.indexOf(cnt) === idx);

    return (
      <div className="container" style={{ padding: '40px 16px 80px 16px', maxWidth: '760px', margin: '0 auto' }}>
        <div className="card" style={{ padding: '40px 32px', textAlign: 'center', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ fontSize: '3.8rem', marginBottom: '12px' }}>🎲</div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '8px' }}>
            {rawExercise.title}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '28px' }}>
            Ngân hàng đề có tổng cộng <strong>{poolSize} câu hỏi</strong>. Bé muốn làm bao nhiêu câu trong lượt thi này?
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px', marginBottom: '32px' }}>
            {presets.map(cnt => {
              const isSelected = selectedRandomCount === cnt;
              return (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => { sound.pop(); setSelectedRandomCount(cnt); }}
                  style={{
                    padding: '18px 12px',
                    borderRadius: '16px',
                    border: isSelected ? '3.5px solid #4F46E5' : '2px solid #E2E8F0',
                    background: isSelected ? '#EEF2FF' : '#F8FAFC',
                    color: isSelected ? '#4F46E5' : '#334155',
                    fontWeight: 900,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    transform: isSelected ? 'translateY(-3px)' : 'none',
                    boxShadow: isSelected ? '0 8px 20px rgba(79, 70, 229, 0.2)' : '0 2px 6px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>
                    {cnt === 10 ? '⚡' : (cnt === 20 ? '🎯' : (cnt === 30 ? '🔥' : (cnt === 50 ? '⭐' : '👑')))}
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{cnt === poolSize ? `Tất cả (${cnt} câu)` : `${cnt} Câu`}</div>
                  <div style={{ fontSize: '0.8rem', color: isSelected ? '#4338CA' : '#64748B', marginTop: '6px', fontWeight: 700 }}>
                    {cnt === 10 ? '~5-10 phút' : (cnt === 20 ? '~15-20 phút' : (cnt === 30 ? '~25-30 phút' : (cnt === 50 ? '~40 phút' : 'Toàn bộ đề')))}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={() => { sound.pop(); onBack(); }} style={{ padding: '14px 24px' }}>
              ◀️ Quay lại
            </button>
            <button
              className="btn-primary"
              onClick={() => handleStartRandomQuiz(selectedRandomCount)}
              style={{ padding: '14px 36px', fontSize: '1.15rem', borderRadius: '14px', fontWeight: 900 }}
            >
              🚀 Bắt Đầu Làm Bài ({selectedRandomCount} Câu)
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = activeQuestions[currentIdx] || {};
  const totalQ = activeQuestions.length;
  const progressPct = ((currentIdx + 1) / totalQ) * 100;
  const mins = Math.floor(secondsElapsed / 60);
  const secs = secondsElapsed % 60;
  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const qType = currentQ.question_type || 'multiple_choice';

  const pairColors = ['#4F46E5', '#059669', '#D97706', '#DB2777', '#7C3AED'];
  const poolLength = rawExercise.questions?.length || 0;
  const isRandomSubset = poolLength > totalQ;

  return (
    <div className="container" style={{ padding: '24px 16px 60px 16px', maxWidth: '960px', margin: '0 auto' }}>
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
        marginBottom: '20px',
        gap: '15px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="btn-secondary" onClick={() => { sound.pop(); onBack(); }}>
            <span>◀️ Quay Lại</span>
          </button>
          {poolLength > 10 && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                sound.pop();
                setIsPreQuizPrompt(true);
              }}
              style={{
                padding: '8px 12px',
                fontSize: '0.85rem',
                background: '#EEF2FF',
                color: '#4F46E5',
                borderColor: '#C7D2FE',
                fontWeight: 800
              }}
              title="Đổi số lượng câu hỏi"
            >
              <span>🎲 Đổi số câu ({totalQ}/{poolLength})</span>
            </button>
          )}
        </div>

        <div style={{ flex: 1, minWidth: '220px', margin: '0 10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px' }}>
            <span>{rawExercise.title}</span>
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
            <span>+{rawExercise.reward_xp || 50} XP</span>
          </div>
        </div>
      </div>

      {/* Random Pool Status Notification Banner */}
      {poolLength > 10 && (
        <div style={{
          background: '#EFF6FF',
          border: '1.5px solid #BFDBFE',
          borderRadius: '12px',
          padding: '10px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '0.9rem',
          color: '#1E40AF',
          fontWeight: 800
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🎲</span>
            <span>Đang làm <strong>{totalQ} câu</strong> (Ngân hàng <strong>{poolLength} câu hỏi</strong>).</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => handleStartRandomQuiz(totalQ)}
              style={{
                background: '#DBEAFE',
                border: '1px solid #93C5FD',
                color: '#1D4ED8',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              🔄 Trộn bộ câu khác
            </button>
            <button
              type="button"
              onClick={() => { sound.pop(); setIsPreQuizPrompt(true); }}
              style={{
                background: '#4F46E5',
                border: 'none',
                color: 'white',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              ⚙️ Chọn số câu (10 / 20 / {poolLength})
            </button>
          </div>
        </div>
      )}

      {/* Main Question Card */}
      <div className="card" style={{ padding: '32px 28px', position: 'relative' }}>
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
              alt="Hình ảnh minh họa câu hỏi"
              style={{
                maxWidth: '100%',
                maxHeight: '340px',
                borderRadius: '16px',
                border: '2px solid var(--border-color)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                objectFit: 'contain'
              }}
            />
          </div>
        )}

        {/* ================= TYPE 1: MULTIPLE CHOICE ================= */}
        {(qType === 'multiple_choice' || !qType) && (
          <div className="options-grid">
            {currentQ.options?.map((opt, idx) => {
              const isSelected = answers[currentQ.id] === opt.option_label;
              return (
                <button
                  key={opt.option_label || idx}
                  type="button"
                  className={`option-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => selectOption(currentQ.id, opt.option_label)}
                >
                  <div className="option-badge">{opt.option_label}</div>
                  <div className="option-text">
                    {opt.answer_text}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ================= TYPE 2: FILL IN BLANK / NUMBER ================= */}
        {qType === 'fill_blank' && (
          <div style={{ margin: '20px 0' }}>
            <div style={{
              background: '#F8FAFC',
              border: '2px dashed #CBD5E1',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              <label style={{ display: 'block', fontWeight: 800, color: '#475569', marginBottom: '12px', fontSize: '1.05rem' }}>
                ✏️ Nhập câu trả lời hoặc kết quả của bé vào ô dưới đây:
              </label>
              <input
                type="text"
                value={answers[currentQ.id] || ''}
                onChange={(e) => handleFillChange(currentQ.id, e.target.value)}
                placeholder="Gõ đáp án ở đây..."
                autoFocus
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  textAlign: 'center',
                  padding: '14px 20px',
                  width: '100%',
                  maxWidth: '360px',
                  border: '2.5px solid #4F46E5',
                  borderRadius: '14px',
                  outline: 'none',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.15)',
                  background: 'white',
                  color: '#1E293B'
                }}
              />
            </div>

            {/* Quick Math Pad for Numbers */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '=', '/', ','].map(char => (
                <button
                  key={char}
                  type="button"
                  onClick={() => handleFillChange(currentQ.id, (answers[currentQ.id] || '') + char)}
                  style={{
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    color: '#334155'
                  }}
                >
                  {char}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleFillChange(currentQ.id, '')}
                style={{
                  background: '#FEE2E2',
                  border: '1px solid #FECDD3',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  color: '#DC2626'
                }}
              >
                Xóa ô
              </button>
            </div>
          </div>
        )}

        {/* ================= TYPE 3: TRUE OR FALSE ================= */}
        {qType === 'true_false' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', margin: '24px 0' }}>
            {[
              { label: 'Đúng', icon: '✅', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
              { label: 'Sai', icon: '❌', color: '#DC2626', bg: '#FEF2F2', border: '#FECDD3' }
            ].map((tf) => {
              const isSelected = (answers[currentQ.id] || '').toLowerCase() === tf.label.toLowerCase();
              return (
                <button
                  key={tf.label}
                  type="button"
                  onClick={() => selectOption(currentQ.id, tf.label)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '30px 20px',
                    borderRadius: '20px',
                    border: isSelected ? `4px solid ${tf.color}` : `2px solid ${tf.border}`,
                    background: isSelected ? tf.bg : '#F8FAFC',
                    cursor: 'pointer',
                    boxShadow: isSelected ? `0 8px 24px rgba(0,0,0,0.12)` : 'none',
                    transform: isSelected ? 'scale(1.02)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '3rem', marginBottom: '12px' }}>{tf.icon}</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: tf.color }}>
                    {tf.label.toUpperCase()}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ================= TYPE 4: MATCHING PAIRS ================= */}
        {qType === 'matching' && (() => {
          const mData = currentQ.matching_data || {};
          let leftList = mData.left || mData.leftItems || mData.left_items || [];
          let rightList = mData.right || mData.rightItems || mData.right_items || [];

          // Fallback parsing if matchingData was empty or unparsed
          if ((!leftList || leftList.length === 0) && Array.isArray(currentQ.options) && currentQ.options.length > 0) {
            let questionItems = [];
            if (currentQ.question_text?.includes(':')) {
              const afterColon = currentQ.question_text.split(':')[1] || '';
              if (afterColon.includes(';') || afterColon.includes(',')) {
                questionItems = afterColon.split(/[;,]/).map(s => s.trim()).filter(Boolean);
              }
            }

            leftList = [];
            rightList = [];
            currentQ.options.forEach((opt, idx) => {
              const str = (typeof opt === 'object' ? (opt.answer_text || '') : String(opt)).trim();
              let lText = '';
              let rText = '';

              if (str.includes('||')) {
                const parts = str.split('||');
                lText = (parts[0] || '').trim();
                rText = (parts[1] || '').trim();
              } else if (str.includes(' - ') || str.includes('➔') || str.includes('->')) {
                const parts = str.split(/[➔\->]|(\s-\s)/);
                lText = (parts[0] || '').trim();
                rText = (parts[parts.length - 1] || '').trim();
              } else if (questionItems[idx]) {
                lText = questionItems[idx];
                rText = str;
              } else {
                lText = `Mục ${idx + 1}`;
                rText = str;
              }

              leftList.push({ id: `${idx + 1}`, text: lText });
              rightList.push({ id: String.fromCharCode(65 + idx), text: rText });
            });
          }

          return (
            <div style={{ margin: '20px 0' }}>
              <p style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.95rem' }}>
                💡 <strong>Hướng dẫn:</strong> Bấm chọn 1 ô ở <strong>Cột A</strong>, sau đó bấm chọn 1 ô tương ứng ở <strong>Cột B</strong> để nối cặp!
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                {/* Left Column (Items) */}
                <div>
                  <h4 style={{ color: '#4F46E5', fontWeight: 800, marginBottom: '12px' }}>Cột A</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {leftList.map((item, idx) => {
                      const currentPair = answers[currentQ.id]?.[item.id];
                      const isSelected = selectedLeft === item.id;
                      const pairColor = currentPair ? pairColors[idx % pairColors.length] : undefined;

                      return (
                        <div
                          key={item.id || idx}
                          onClick={() => handleMatchingClickLeft(item.id)}
                          style={{
                            padding: '14px 18px',
                            borderRadius: '14px',
                            border: isSelected ? '3px solid #4F46E5' : (currentPair ? `2.5px solid ${pairColor}` : '2px solid #E2E8F0'),
                            background: isSelected ? '#EEF2FF' : (currentPair ? `${pairColor}15` : '#F8FAFC'),
                            color: isSelected ? '#4F46E5' : '#1E293B',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.15s ease',
                            boxShadow: isSelected ? '0 4px 12px rgba(79, 70, 229, 0.15)' : 'none'
                          }}
                        >
                          <span><strong>{idx + 1}.</strong> {item.text}</span>
                          {currentPair && (
                            <span style={{
                              background: pairColor,
                              color: 'white',
                              borderRadius: '9999px',
                              padding: '3px 10px',
                              fontSize: '0.8rem',
                              fontWeight: 900
                            }}>
                              ➔ {currentPair}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column (Targets) */}
                <div>
                  <h4 style={{ color: '#059669', fontWeight: 800, marginBottom: '12px' }}>Cột B</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {rightList.map((target, idx) => {
                      const matchingState = answers[currentQ.id] || {};
                      const connectedLeft = Object.keys(matchingState).find(k => matchingState[k] === target.id);

                      return (
                        <div
                          key={target.id || idx}
                          onClick={() => handleMatchingClickRight(currentQ.id, target.id)}
                          style={{
                            padding: '14px 18px',
                            borderRadius: '14px',
                            border: selectedLeft ? '2.5px dashed #059669' : (connectedLeft ? '2.5px solid #059669' : '2px solid #E2E8F0'),
                            background: connectedLeft ? '#ECFDF5' : (selectedLeft ? '#F0FDF4' : '#F8FAFC'),
                            color: '#1E293B',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span><strong>{target.id}.</strong> {target.text}</span>
                          {connectedLeft && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveMatchingPair(currentQ.id, connectedLeft);
                              }}
                              title="Hủy nối cặp này"
                              style={{
                                background: '#FEE2E2',
                                color: '#DC2626',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '3px 8px',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                cursor: 'pointer'
                              }}
                            >
                              ✖ Hủy
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Pedagogical Hint Toggle */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <button
            className="btn-secondary"
            onClick={() => { sound.pop(); setShowHint(prev => !prev); }}
            style={{ fontSize: '0.9rem', color: '#D97706', borderColor: '#FDE68A', background: '#FFFBEB' }}
          >
            <span>💡 {showHint ? 'Ẩn Gợi Ý' : 'Xem Gợi Ý Sư Phạm'}</span>
          </button>

          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            {answers[currentQ.id] !== undefined && answers[currentQ.id] !== '' ? '✅ Đã chọn đáp án' : '⏳ Chưa trả lời'}
          </span>
        </div>

        {/* Hint Content Box */}
        {showHint && (
          <div style={{
            marginTop: '16px',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: '#FEF3C7',
            border: '2px solid #FDE68A',
            color: '#92400E',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            fontWeight: 700
          }}>
            <strong>💡 Gợi ý tư duy:</strong> {currentQ.hint || 'Bé hãy đọc kỹ đề bài và loại trừ các đáp án chưa chính xác nhé!'}
          </div>
        )}
      </div>

      {/* Action Footer Navigation */}
      <div style={{
        marginTop: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <button
          className="btn-secondary"
          onClick={prevQuestion}
          disabled={currentIdx === 0}
          style={{ opacity: currentIdx === 0 ? 0.5 : 1 }}
        >
          <span>⬅️ Câu Trước</span>
        </button>

        {/* Navigation Quick Dots */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {activeQuestions.map((q, idx) => {
            const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '';
            const isCurrent = idx === currentIdx;
            return (
              <button
                key={q.id || idx}
                type="button"
                onClick={() => { sound.pop(); setCurrentIdx(idx); setShowHint(false); setSelectedLeft(null); }}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: isCurrent ? '2.5px solid #4F46E5' : '1.5px solid #CBD5E1',
                  background: isCurrent ? '#4F46E5' : (isAnswered ? '#10B981' : '#F1F5F9'),
                  color: isCurrent || isAnswered ? 'white' : '#64748B',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {currentIdx < activeQuestions.length - 1 ? (
          <button className="btn-primary" onClick={nextQuestion}>
            <span>Câu Tiếp Theo ➡️</span>
          </button>
        ) : (
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{ background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none' }}
          >
            <span>{isSubmitting ? '⏳ Đang Chấm Điểm...' : '🚀 Hoàn Thành & Nộp Bài'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
