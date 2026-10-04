import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { sound } from '../services/audio';
import { useAuth } from '../context/AuthContext';

export default function SubjectsPage({ onStartExercise }) {
  const { user, setShowProfileModal } = useAuth();
  const currentGrade = user.grade_level || 1;

  const [selectedSubject, setSelectedSubject] = useState(1); // 1: Toan
  const [subjects, setSubjects] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadLessons(selectedSubject, currentGrade);
    }
  }, [selectedSubject, currentGrade]);

  const loadSubjects = async () => {
    const res = await api.getSubjects();
    if (res.success && res.subjects) {
      setSubjects(res.subjects);
      if (res.subjects.length > 0) setSelectedSubject(res.subjects[0].id);
    }
  };

  const loadLessons = async (subjId, grade) => {
    setLoading(true);
    const res = await api.getLessons(subjId, grade);
    if (res.success && res.lessons) {
      setLessons(res.lessons);
    }
    setLoading(false);
  };

  const gradeNameMap = {
    1: 'Lớp 1 🌱 (Làm quen chữ & số)',
    2: 'Lớp 2 🐥 (Phép cộng trừ có nhớ & bảng nhân 2, 5)',
    3: 'Lớp 3 🐱 (Bảng cửu chương nhân chia & chu vi)',
    4: 'Lớp 4 🚀 (Phân số, hình học & từ loại)',
    5: 'Lớp 5 👑 (Số thập phân & tỉ số phần trăm)'
  };

  return (
    <div className="container" style={{ padding: '24px 0 60px 0' }}>
      {/* Current Grade Lock Banner with Quick Upgrade Button */}
      <div style={{
        background: 'white',
        border: '2px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--card-shadow)',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontSize: '2.5rem' }}>🏫</div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)' }}>
              KHỐI LỚP HIỆN TẠI CỦA BÉ:
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--primary)' }}>
              {gradeNameMap[currentGrade] || `Lớp ${currentGrade}`}
            </div>
          </div>
        </div>

        <button
          className="btn-secondary"
          onClick={() => { sound.pop(); setShowProfileModal(true); }}
          style={{ background: '#EEF2FF', color: 'var(--primary)', border: '1.5px solid #C7D2FE' }}
        >
          <span>✏️ Bé vừa lên lớp mới? Bấm để đổi lớp</span>
        </button>
      </div>

      {/* Subject Tabs */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '10px' }}>
          📚 Chọn Môn Học Của Lớp {currentGrade}:
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {subjects.map(s => (
            <button
              key={s.id}
              onClick={() => { sound.pop(); setSelectedSubject(s.id); }}
              className={`nav-btn ${selectedSubject === s.id ? 'active' : ''}`}
              style={{
                padding: '12px 22px',
                fontSize: '1.05rem',
                borderWidth: '2px'
              }}
            >
              <span>{s.icon}</span>
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lessons & Exercises Grid for the Locked Grade */}
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '16px' }}>
          📝 Danh Sách Bài Học & Bài Tập Dành Cho Lớp {currentGrade}:
        </h3>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '30px' }}>⏳ Đang tải danh sách bài học...</p>
        ) : lessons.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <span style={{ fontSize: '3rem' }}>🎒</span>
            <h4 style={{ marginTop: '10px' }}>Chưa có bài tập cho môn này ở Lớp {currentGrade}</h4>
            <p style={{ color: 'var(--text-muted)' }}>Bé hãy chọn môn Toán Học hoặc Tiếng Việt để luyện tập ngay nhé!</p>
          </div>
        ) : (
          <div className="grid-3">
            {lessons.map(lesson => (
              <div key={lesson.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <div style={{
                      fontSize: '2rem',
                      background: '#EFF6FF',
                      width: '50px',
                      height: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      {lesson.icon || '📖'}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{lesson.title}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800 }}>
                        Lớp {currentGrade} • #{lesson.topic_tag}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '16px' }}>
                    {lesson.description}
                  </p>
                </div>

                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderTop: '1.5px dashed var(--border-color)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    marginBottom: '12px'
                  }}>
                    <span>⏱️ 15 phút</span>
                    <span style={{ color: '#B45309', fontWeight: 800 }}>⭐ Thưởng +{currentGrade === 1 ? 30 : (currentGrade === 5 ? 60 : 50)} XP</span>
                  </div>

                  <button
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => {
                      sound.pop();
                      // Map lesson to appropriate grade exercise
                      let targetExId = 101;
                      if (currentGrade === 1) targetExId = 10;
                      else if (currentGrade === 2) targetExId = 20;
                      else if (currentGrade === 3) targetExId = 30;
                      else if (currentGrade === 4) {
                        targetExId = lesson.id === 2 ? 102 : (lesson.id === 4 ? 103 : 101);
                      } else if (currentGrade === 5) {
                        targetExId = 50;
                      }
                      onStartExercise(targetExId);
                    }}
                  >
                    <span>Làm Bài Tập Ngay</span>
                    <span>🚀</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
