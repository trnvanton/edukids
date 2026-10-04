import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { sound } from '../services/audio';

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({ class_id: '1', title: 'Bài tập ôn tập Phân số cuối tuần' });

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

  const handleAssign = (e) => {
    e.preventDefault();
    sound.pop();
    alert(`🎉 Đã giao bài "${assignForm.title}" thành công cho Lớp 4A1!`);
    setShowAssignModal(false);
  };

  if (loading || !data) {
    return (
      <div className="container" style={{ padding: '40px 0', textAlign: 'center' }}>
        <h2>⏳ Đang tải dữ liệu lớp học của giáo viên...</h2>
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
            Theo dõi tiến độ, phân tích điểm mạnh/yếu của từng học sinh và giao bài tập rèn luyện cho các lớp phụ trách.
          </p>
          <div style={{ marginTop: '16px' }}>
            <button className="btn-primary" onClick={() => { sound.pop(); setShowAssignModal(true); }}>
              <span>➕ Giao Bài Tập Mới Cho Lớp</span>
            </button>
          </div>
        </div>
        <div style={{ fontSize: '4.5rem' }}>🎓</div>
      </div>

      {/* Class Analytics Section */}
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
                Năm học {cls.schoolYear} • Sĩ số: <strong>{cls.stats.totalStudents} học sinh</strong>
              </span>
            </div>

            <div className="chip" style={{ background: '#D1FAE5', color: '#065F46', border: '1.5px solid #A7F3D0', fontSize: '0.95rem' }}>
              <span>📊 Điểm TB Lớp: <strong>{cls.stats.classAverageScore} / 10</strong></span>
            </div>
          </div>

          {/* Alert for Struggling Students */}
          {cls.stats.strugglingStudents.length > 0 && (
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
                <strong>Cảnh báo học tập:</strong> Có {cls.stats.strugglingStudents.length} học sinh cần hỗ trợ thêm bài tập bổ trợ cơ bản:
                {cls.stats.strugglingStudents.map(s => (
                  <span key={s.id} style={{ marginLeft: '6px', background: 'white', padding: '2px 8px', borderRadius: '6px', border: '1px solid #FECDD3' }}>
                    {s.full_name} ({s.averageScore}đ)
                  </span>
                ))}
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
                <th>Số Bài Đã Làm</th>
                <th>Điểm Trung Bình</th>
                <th>Đánh Giá Tiến Độ</th>
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
                      <span style={{ color: '#059669', fontWeight: 800 }}>🌟 Học sinh xuất sắc</span>
                    ) : st.averageScore >= 7.0 ? (
                      <span style={{ color: '#D97706', fontWeight: 800 }}>👍 Đạt chuẩn kiến thức</span>
                    ) : (
                      <span style={{ color: '#DC2626', fontWeight: 800 }}>⚡ Cần luyện tập thêm</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Assign Modal */}
      {showAssignModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '90%', padding: '28px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '16px' }}>📝 Giao Bài Tập Mới</h3>
            <form onSubmit={handleAssign}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>Lớp nhận bài:</label>
                <select
                  value={assignForm.class_id}
                  onChange={e => setAssignForm({ ...assignForm, class_id: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontWeight: 700 }}
                >
                  <option value="1">Lớp 4A1 (3 học sinh)</option>
                  <option value="2">Lớp 3A2</option>
                  <option value="3">Lớp 1B</option>
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>Tên bài tập:</label>
                <input
                  type="text"
                  value={assignForm.title}
                  onChange={e => setAssignForm({ ...assignForm, title: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontWeight: 700 }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAssignModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary">Giao Bài Ngay 🚀</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
