import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { sound } from '../services/audio';

export default function SubjectsPage({ onStartExercise }) {
  const [selectedGrade, setSelectedGrade] = useState(4);
  const [selectedSubject, setSelectedSubject] = useState(1); // 1: Toan
  const [subjects, setSubjects] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadLessons(selectedSubject, selectedGrade);
    }
  }, [selectedSubject, selectedGrade]);

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

  const gradesList = [
    { num: 1, name: 'Lớp 1', icon: '🌱' },
    { num: 2, name: 'Lớp 2', icon: '🐥' },
    { num: 3, name: 'Lớp 3', icon: '🐱' },
    { num: 4, name: 'Lớp 4', icon: '🚀' },
    { num: 5, name: 'Lớp 5', icon: '👑' }
  ];

  return (
    <div className="container" style={{ padding: '24px 0 60px 0' }}>
      {/* Grade Selector Pills */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '10px' }}>
          🏫 Chọn Khối Lớp:
        </h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {gradesList.map(g => (
            <button
              key={g.num}
              onClick={() => { sound.pop(); setSelectedGrade(g.num); }}
              className={`nav-btn ${selectedGrade === g.num ? 'active' : ''}`}
              style={{ padding: '10px 20px', fontSize: '1rem' }}
            >
              <span>{g.icon}</span>
              <span>{g.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Subject Tabs */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '10px' }}>
          📚 Chọn Môn Học:
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

      {/* Lessons & Exercises Grid */}
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '16px' }}>
          📝 Danh Sách Chuyên Đề & Bài Tập:
        </h3>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '30px' }}>⏳ Đang tải danh sách bài học...</p>
        ) : lessons.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <span style={{ fontSize: '3rem' }}>🎒</span>
            <h4 style={{ marginTop: '10px' }}>Chưa có bài tập cho môn này ở Lớp {selectedGrade}</h4>
            <p style={{ color: 'var(--text-muted)' }}>Bé hãy chọn Lớp 4 hoặc môn Toán / Tiếng Việt để trải nghiệm đầy đủ nhé!</p>
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
                        Chuyên đề: #{lesson.topic_tag}
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
                    <span style={{ color: '#B45309', fontWeight: 800 }}>⭐ Thưởng +50 XP</span>
                  </div>

                  <button
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => {
                      sound.pop();
                      // Map lesson to default exercise 101, 102, 103
                      const exId = lesson.id === 1 ? 101 : (lesson.id === 2 ? 102 : (lesson.id === 4 ? 103 : 101));
                      onStartExercise(exId);
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
