import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { sound } from '../services/audio';
import { useToast } from '../context/ToastContext';
import { useDialog } from '../context/DialogContext';

export default function TeacherDashboard() {
  const { showSuccess } = useToast();
  const { alert: dialogAlert } = useDialog();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTeacherTab, setActiveTeacherTab] = useState('classes'); // 'classes', 'create-class', 'create-exercise', 'assign'

  // Form states
  const [newClassName, setNewClassName] = useState('5A2');
  const [newClassGrade, setNewClassGrade] = useState('5');
  const [newStudentName, setNewStudentName] = useState('');
  const [targetClassForStudent, setTargetClassForStudent] = useState('1');

  // New Exercise Creator state
  const [newExTitle, setNewExTitle] = useState('Bài Tập Rèn Luyện Tư Duy Mới');
  const [newExGrade, setNewExGrade] = useState('4');
  const [newExSubject, setNewExSubject] = useState('Toán Học');
  const [newQuestionText, setNewQuestionText] = useState('Tính nhẩm nhanh: 25 x 4 = ?');
  const [optA, setOptA] = useState('80');
  const [optB, setOptB] = useState('100');
  const [optC, setOptC] = useState('120');
  const [optD, setOptD] = useState('150');
  const [correctOpt, setCorrectOpt] = useState('B');
  const [newExplanation, setNewExplanation] = useState('Giải thích: 25 x 4 = 100. Bé có thể nhẩm 25 x 2 = 50, rồi nhân 2 lần nữa ra 100.');

  // Assign state
  const [assignClassId, setAssignClassId] = useState('1');
  const [assignTitle, setAssignTitle] = useState('Ôn tập phân số cuối tuần');

  useEffect(() => {
    loadTeacherData();
  }, []);

  const loadTeacherData = async () => {
    setLoading(true);
    const res = await api.getTeacherDashboard();
    if (res.success) {
      setData(res);
    }
    setLoading(false);
  };

  const handleCreateClass = (e) => {
    e.preventDefault();
    sound.pop();
    showSuccess('Tạo Lớp Thành Công', `Đã tạo thành công Lớp ${newClassName} (Khối ${newClassGrade})!`);
    setActiveTeacherTab('classes');
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    sound.pop();
    if (!newStudentName) return;
    showSuccess('Thêm Học Sinh', `Đã thêm học sinh "${newStudentName}" vào Lớp 4A1 thành công!`);
    setNewStudentName('');
  };

  const handleCreateExercise = (e) => {
    e.preventDefault();
    sound.pop();
    showSuccess('Tạo Bài Tập', `Đã tạo bài tập mới "${newExTitle}" kèm câu hỏi và lời giải chi tiết!`);
    setActiveTeacherTab('classes');
  };

  const handleAssign = (e) => {
    e.preventDefault();
    sound.pop();
    showSuccess('Giao Bài Tập', `Đã giao bài "${assignTitle}" cho lớp thành công!`);
    setActiveTeacherTab('classes');
  };

  if (loading || !data) {
    return (
      <div className="container" style={{ padding: '40px 0', textAlign: 'center' }}>
        <h2>⏳ Đang tải dữ liệu giáo viên từ MySQL...</h2>
      </div>
    );
  }

  const { teacher, classAnalytics } = data;

  return (
    <div className="container" style={{ padding: '24px 0 60px 0' }}>
      {/* Teacher Hero Banner */}
      <div className="hero-banner" style={{ background: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #3B82F6 100%)' }}>
        <div>
          <h2 className="hero-title">Góc Giáo Viên: {teacher.full_name} 👩‍🏫</h2>
          <p className="hero-desc">
            Quản lý lớp học, thêm học sinh, soạn bài tập có lời giải thích sư phạm và theo dõi tiến độ từng em.
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className={`nav-btn ${activeTeacherTab === 'classes' ? 'active' : ''}`}
              onClick={() => { sound.pop(); setActiveTeacherTab('classes'); }}
            >
              🏫 Lớp Học & Điểm Số
            </button>
            <button
              className={`nav-btn ${activeTeacherTab === 'create-class' ? 'active' : ''}`}
              onClick={() => { sound.pop(); setActiveTeacherTab('create-class'); }}
            >
              ➕ Tạo Lớp & Thêm Học Sinh
            </button>
            <button
              className={`nav-btn ${activeTeacherTab === 'create-exercise' ? 'active' : ''}`}
              onClick={() => { sound.pop(); setActiveTeacherTab('create-exercise'); }}
            >
              ✍️ Soạn Bài Tập & Câu Hỏi
            </button>
            <button
              className={`nav-btn ${activeTeacherTab === 'assign' ? 'active' : ''}`}
              onClick={() => { sound.pop(); setActiveTeacherTab('assign'); }}
            >
              📤 Giao Bài Cho Lớp
            </button>
          </div>
        </div>
        <div style={{ fontSize: '4.5rem' }}>🎓</div>
      </div>

      {/* TAB 1: CLASSES & STUDENT SCORES */}
      {activeTeacherTab === 'classes' && (
        <div>
          {classAnalytics.map(cls => (
            <div key={cls.classId} className="card" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 900,
                    fontSize: '1.2rem'
                  }}>
                    Lớp {cls.className}
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>
                    Khối {cls.gradeLevel} • Năm học {cls.schoolYear} • Sĩ số: <strong>{cls.stats.totalStudents} học sinh</strong>
                  </span>
                </div>

                <div className="chip" style={{ background: '#D1FAE5', color: '#065F46', border: '1.5px solid #A7F3D0', fontSize: '0.95rem' }}>
                  <span>📊 Điểm TB Lớp: <strong>{cls.stats.classAverageScore} / 10</strong></span>
                </div>
              </div>

              {/* Alert for Struggling Students */}
              {cls.stats.strugglingStudents && cls.stats.strugglingStudents.length > 0 && (
                <div style={{
                  background: '#FFF1F2',
                  border: '2px solid #FECDD3',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 18px',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '1.6rem' }}>🚨</span>
                  <div style={{ fontSize: '0.92rem', color: '#9F1239', fontWeight: 700 }}>
                    <strong>Cảnh báo học sinh yếu:</strong> Em {cls.stats.strugglingStudents.map(s => s.full_name).join(', ')} có điểm dưới 7.0 (cần giao bài tập phụ đạo bổ sung).
                  </div>
                </div>
              )}

              {/* Student Table with Scores */}
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Học Sinh</th>
                    <th>Khối Lớp</th>
                    <th>XP Tích Lũy</th>
                    <th>Bài Đã Làm</th>
                    <th>Điểm TB</th>
                    <th>Đánh Giá & Nhận Xét</th>
                  </tr>
                </thead>
                <tbody>
                  {cls.stats.studentSummary.map(st => (
                    <tr key={st.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.4rem' }}>{st.avatar === 'mascot-bear' ? '🐻' : (st.avatar === 'mascot-lion' ? '🦁' : '🐰')}</span>
                          <strong>{st.full_name}</strong>
                        </div>
                      </td>
                      <td>Lớp {st.grade_level}</td>
                      <td><span style={{ color: '#B45309', fontWeight: 900 }}>⭐ {st.xp} XP</span></td>
                      <td>{st.submissionsCount} bài</td>
                      <td>
                        <span className={`score-tag ${st.averageScore >= 8.5 ? 'high' : (st.averageScore >= 7.0 ? 'mid' : 'low')}`}>
                          {st.averageScore} / 10
                        </span>
                      </td>
                      <td>
                        {st.averageScore >= 8.5 ? (
                          <span style={{ color: '#059669', fontWeight: 800 }}>🌟 Nắm rất vững kiến thức</span>
                        ) : st.averageScore >= 7.0 ? (
                          <span style={{ color: '#D97706', fontWeight: 800 }}>👍 Đạt chuẩn chương trình</span>
                        ) : (
                          <span style={{ color: '#DC2626', fontWeight: 800 }}>⚡ Cần ôn thêm Phân Số</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: CREATE CLASS & ADD STUDENT */}
      {activeTeacherTab === 'create-class' && (
        <div className="grid-2">
          {/* Create Class Card */}
          <div className="card">
            <div className="card-title">
              <span>🏫</span>
              <span>Tạo Lớp Học Mới</span>
            </div>
            <form onSubmit={handleCreateClass}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>Tên lớp học:</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  placeholder="Ví dụ: 3A1, 4B, 5C..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontWeight: 700 }}
                  required
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>Khối lớp:</label>
                <select
                  value={newClassGrade}
                  onChange={e => setNewClassGrade(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontWeight: 700 }}
                >
                  <option value="1">Lớp 1 🌱</option>
                  <option value="2">Lớp 2 🐥</option>
                  <option value="3">Lớp 3 🐱</option>
                  <option value="4">Lớp 4 🚀</option>
                  <option value="5">Lớp 5 👑</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <span>Tạo Lớp Học 🚀</span>
              </button>
            </form>
          </div>

          {/* Add Student Card */}
          <div className="card">
            <div className="card-title">
              <span>👦</span>
              <span>Thêm Học Sinh Vào Lớp</span>
            </div>
            <form onSubmit={handleAddStudent}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>Chọn lớp tiếp nhận:</label>
                <select
                  value={targetClassForStudent}
                  onChange={e => setTargetClassForStudent(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontWeight: 700 }}
                >
                  <option value="1">Lớp 4A1 (Cô Hoàng Mai)</option>
                  <option value="2">Lớp 2A3</option>
                  <option value="3">Lớp 1B</option>
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>Họ và tên học sinh:</label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  placeholder="Ví dụ: Bé Lê Hoàng Nam..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontWeight: 700 }}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <span>Thêm Vào Danh Sách Lớp ➕</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: CREATE EXERCISE & QUESTIONS */}
      {activeTeacherTab === 'create-exercise' && (
        <div className="card">
          <div className="card-title">
            <span>✍️</span>
            <span>Soạn Bài Tập & Tạo Câu Hỏi Mới Kèm Lời Giải</span>
          </div>

          <form onSubmit={handleCreateExercise}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>Tên bài tập:</label>
                <input
                  type="text"
                  value={newExTitle}
                  onChange={e => setNewExTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontWeight: 700 }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>Môn học:</label>
                <select
                  value={newExSubject}
                  onChange={e => setNewExSubject(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontWeight: 700 }}
                >
                  <option value="Toán Học">📐 Toán Học</option>
                  <option value="Tiếng Việt">📖 Tiếng Việt</option>
                  <option value="Khoa Học">🔬 Khoa Học</option>
                  <option value="Tiếng Anh">🇬🇧 Tiếng Anh</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>Khối lớp:</label>
                <select
                  value={newExGrade}
                  onChange={e => setNewExGrade(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontWeight: 700 }}
                >
                  <option value="1">Lớp 1 🌱</option>
                  <option value="2">Lớp 2 🐥</option>
                  <option value="3">Lớp 3 🐱</option>
                  <option value="4">Lớp 4 🚀</option>
                  <option value="5">Lớp 5 👑</option>
                </select>
              </div>
            </div>

            {/* Question Statement */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>Nội dung câu hỏi:</label>
              <textarea
                value={newQuestionText}
                onChange={e => setNewQuestionText(e.target.value)}
                rows={2}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontWeight: 700, fontFamily: 'inherit' }}
                required
              />
            </div>

            {/* 4 Options */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontWeight: 700 }}>Đáp án A:</label>
                <input type="text" value={optA} onChange={e => setOptA(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1.5px solid var(--border-color)', fontWeight: 700 }} required />
              </div>
              <div>
                <label style={{ fontWeight: 700 }}>Đáp án B:</label>
                <input type="text" value={optB} onChange={e => setOptB(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1.5px solid var(--border-color)', fontWeight: 700 }} required />
              </div>
              <div>
                <label style={{ fontWeight: 700 }}>Đáp án C:</label>
                <input type="text" value={optC} onChange={e => setOptC(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1.5px solid var(--border-color)', fontWeight: 700 }} required />
              </div>
              <div>
                <label style={{ fontWeight: 700 }}>Đáp án D:</label>
                <input type="text" value={optD} onChange={e => setOptD(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1.5px solid var(--border-color)', fontWeight: 700 }} required />
              </div>
            </div>

            {/* Correct Option */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>Chọn đáp án đúng:</label>
              <select
                value={correctOpt}
                onChange={e => setCorrectOpt(e.target.value)}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '2px solid #10B981', background: '#D1FAE5', fontWeight: 900, color: '#065F46' }}
              >
                <option value="A">Đáp án A</option>
                <option value="B">Đáp án B</option>
                <option value="C">Đáp án C</option>
                <option value="D">Đáp án D</option>
              </select>
            </div>

            {/* Pedagogical Explanation */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>
                💡 Lời giải thích chi tiết từng bước (Dành cho học sinh xem sau khi nộp bài):
              </label>
              <textarea
                value={newExplanation}
                onChange={e => setNewExplanation(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #FDE68A', background: '#FFFBEB', fontWeight: 700, color: '#78350F', fontFamily: 'inherit' }}
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <span>Lưu Bài Tập Vào Ngân Hàng Câu Hỏi 💾</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: ASSIGN EXERCISE */}
      {activeTeacherTab === 'assign' && (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card-title">
            <span>📤</span>
            <span>Giao Bài Tập Cho Lớp Học</span>
          </div>
          <form onSubmit={handleAssign}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>Chọn lớp nhận bài:</label>
              <select
                value={assignClassId}
                onChange={e => setAssignClassId(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontWeight: 700 }}
              >
                <option value="1">Lớp 4A1 (3 học sinh)</option>
                <option value="2">Lớp 2A3 (1 học sinh)</option>
                <option value="3">Lớp 1B</option>
              </select>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>Tên bài tập:</label>
              <input
                type="text"
                value={assignTitle}
                onChange={e => setAssignTitle(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontWeight: 700 }}
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <span>Giao Bài Cho Học Sinh Ngay 🚀</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
