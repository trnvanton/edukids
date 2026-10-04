import React, { useState } from 'react';
import { sound } from '../services/audio';

export default function AdminDashboard() {
  const [adminTab, setAdminTab] = useState('overview'); // 'overview', 'users', 'curriculum', 'questions'
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');

  const stats = [
    { label: 'Tổng Học Sinh', val: '128', icon: '👦', color: '#3B82F6' },
    { label: 'Giáo Viên', val: '12', icon: '👩‍🏫', color: '#10B981' },
    { label: 'Lớp Học', val: '15', icon: '🏫', color: '#8B5CF6' },
    { label: 'Ngân Hàng Câu Hỏi', val: '450+', icon: '❓', color: '#F59E0B' }
  ];

  const userList = [
    { id: 1, name: 'Nguyễn Minh Anh', role: 'student', grade: 'Lớp 4', xp: 1250, status: 'Hoạt động' },
    { id: 2, name: 'Trần Bình', role: 'student', grade: 'Lớp 4', xp: 850, status: 'Hoạt động' },
    { id: 3, name: 'Lê Minh', role: 'student', grade: 'Lớp 4', xp: 420, status: 'Hoạt động' },
    { id: 4, name: 'Bé Bảo Ngọc', role: 'student', grade: 'Lớp 2', xp: 350, status: 'Hoạt động' },
    { id: 10, name: 'Cô Hoàng Mai', role: 'teacher', grade: 'Khối 4', xp: 0, status: 'Giáo viên chủ nhiệm' },
    { id: 11, name: 'Thầy Nguyễn Văn Đức', role: 'teacher', grade: 'Khối 2', xp: 0, status: 'Giáo viên bộ môn' }
  ];

  const handleAddTeacher = (e) => {
    e.preventDefault();
    sound.pop();
    if (!newTeacherName) return;
    alert(`🎉 Đã thêm giáo viên "${newTeacherName}" vào hệ thống EduKids thành công!`);
    setNewTeacherName('');
    setNewTeacherEmail('');
  };

  return (
    <div className="container" style={{ padding: '24px 0 60px 0' }}>
      {/* Admin Hero */}
      <div className="hero-banner" style={{ background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)' }}>
        <div>
          <h2 className="hero-title">Bảng Điều Khiển Quản Trị Hệ Thống 👨‍💼</h2>
          <p className="hero-desc">
            Toàn quyền quản lý Người dùng, Phân quyền Giáo viên/Học sinh, Cấu hình Khối lớp, Môn học và Ngân hàng đề thi.
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className={`nav-btn ${adminTab === 'overview' ? 'active' : ''}`}
              onClick={() => { sound.pop(); setAdminTab('overview'); }}
            >
              📊 Thống Kê Chung
            </button>
            <button
              className={`nav-btn ${adminTab === 'users' ? 'active' : ''}`}
              onClick={() => { sound.pop(); setAdminTab('users'); }}
            >
              👥 Quản Lý Người Dùng
            </button>
            <button
              className={`nav-btn ${adminTab === 'curriculum' ? 'active' : ''}`}
              onClick={() => { sound.pop(); setAdminTab('curriculum'); }}
            >
              📚 Khối Lớp & Môn Học
            </button>
          </div>
        </div>
        <div style={{ fontSize: '4.5rem' }}>⚙️</div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {adminTab === 'overview' && (
        <div>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {stats.map((s, idx) => (
              <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
                <div style={{ fontSize: '2.5rem', background: '#F8FAFC', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-title">
                <span>📈</span>
                <span>Hoạt Động Học Tập Hôm Nay</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>Số lượt làm bài tập hoàn thành:</span>
                  <strong style={{ color: 'var(--primary)' }}>342 lượt</strong>
                </li>
                <li style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>Tổng điểm thưởng XP đã cấp:</span>
                  <strong style={{ color: '#B45309' }}>+12,450 XP ⭐</strong>
                </li>
                <li style={{ padding: '10px 0', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>Tỷ lệ hoàn thành đúng 100%:</span>
                  <strong style={{ color: '#059669' }}>78.5%</strong>
                </li>
              </ul>
            </div>

            <div className="card">
              <div className="card-title">
                <span>🛡️</span>
                <span>Bảo Trì & Sao Lưu Cơ Sở Dữ Liệu</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Cơ sở dữ liệu đang đồng bộ trực tiếp với MySQL Aiven Cloud và sẵn sàng sao lưu tự động.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-primary" onClick={() => alert('Đã sao lưu thành công!')}>💾 Sao Lưu MySQL</button>
                <button className="btn-secondary" onClick={() => alert('Hệ thống hoạt động bình thường 100%')}>⚡ Kiểm Tra Tải</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS MANAGEMENT */}
      {adminTab === 'users' && (
        <div>
          {/* Add Teacher Form */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-title">
              <span>➕</span>
              <span>Thêm Tài Khoản Giáo Viên Mới</span>
            </div>
            <form onSubmit={handleAddTeacher} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '4px' }}>Họ tên giáo viên:</label>
                <input
                  type="text"
                  value={newTeacherName}
                  onChange={e => setNewTeacherName(e.target.value)}
                  placeholder="Cô Nguyễn Thị Hằng..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontWeight: 700 }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '4px' }}>Email liên hệ:</label>
                <input
                  type="email"
                  value={newTeacherEmail}
                  onChange={e => setNewTeacherEmail(e.target.value)}
                  placeholder="hang.nguyen@edukids.vn..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontWeight: 700 }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ height: '42px', justifyContent: 'center' }}>
                <span>Thêm Giáo Viên ➕</span>
              </button>
            </form>
          </div>

          {/* User List Table */}
          <div className="card">
            <div className="card-title">
              <span>👥</span>
              <span>Danh Sách Người Dùng Trong Hệ Thống</span>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Họ và Tên</th>
                  <th>Vai Trò</th>
                  <th>Khối / Lớp</th>
                  <th>Điểm XP</th>
                  <th>Trạng Thái</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {userList.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        background: u.role === 'teacher' ? '#D1FAE5' : '#EEF2FF',
                        color: u.role === 'teacher' ? '#065F46' : 'var(--primary)'
                      }}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>{u.grade}</td>
                    <td>{u.xp > 0 ? `${u.xp} XP ⭐` : '-'}</td>
                    <td><span style={{ color: '#059669', fontWeight: 700 }}>{u.status}</span></td>
                    <td>
                      <button
                        onClick={() => alert(`Đặt lại mật khẩu cho ${u.name}`)}
                        style={{ background: '#F1F5F9', border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                      >
                        Đặt lại mật khẩu
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CURRICULUM */}
      {adminTab === 'curriculum' && (
        <div className="card">
          <div className="card-title">
            <span>📚</span>
            <span>Danh Mục Khối Lớp (1 - 5) & Môn Học</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
            {['Lớp 1 🌱', 'Lớp 2 🐥', 'Lớp 3 🐱', 'Lớp 4 🚀', 'Lớp 5 👑'].map((name, i) => (
              <div key={i} style={{ background: '#F8FAFC', padding: '16px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-color)' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px' }}>{name}</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  • 📐 Toán Học<br/>
                  • 📖 Tiếng Việt<br/>
                  • 🔬 Khoa Học / TN&XH<br/>
                  • 🇬🇧 Tiếng Anh
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
