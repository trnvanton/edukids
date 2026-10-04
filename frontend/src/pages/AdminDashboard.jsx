import React from 'react';

export default function AdminDashboard() {
  const stats = [
    { label: 'Tổng Học Sinh', val: '128', icon: '👦', color: '#3B82F6' },
    { label: 'Giáo Viên', val: '12', icon: '👩‍🏫', color: '#10B981' },
    { label: 'Lớp Học', val: '15', icon: '🏫', color: '#8B5CF6' },
    { label: 'Ngân Hàng Câu Hỏi', val: '450+', icon: '❓', color: '#F59E0B' }
  ];

  return (
    <div className="container" style={{ padding: '24px 0 60px 0' }}>
      <div className="hero-banner" style={{ background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)' }}>
        <div>
          <h2 className="hero-title">Bảng Điều Khiển Quản Trị Hệ Thống 👨‍💼</h2>
          <p className="hero-desc">
            Toàn quyền quản lý Người dùng, Lớp học, Môn học, Bài tập và Ngân hàng câu hỏi của toàn hệ thống EduKids.
          </p>
        </div>
        <div style={{ fontSize: '4.5rem' }}>⚙️</div>
      </div>

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

      {/* Quick Management Actions */}
      <div className="grid-2">
        <div className="card">
          <div className="card-title">
            <span>👥</span>
            <span>Quản Lý Người Dùng & Phân Quyền</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
            Thêm tài khoản giáo viên, đặt lại mật khẩu học sinh, phân chia khối lớp.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => alert('Chức năng thêm người dùng')}>➕ Thêm Giáo Viên Mới</button>
            <button className="btn-secondary" onClick={() => alert('Xuất danh sách học sinh')}>📥 Xuất Báo Cáo Excel</button>
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <span>📚</span>
            <span>Ngân Hàng Đề Thi & Chuyên Đề</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
            Quản lý ngân hàng câu hỏi môn Toán, Tiếng Việt, Khoa học theo chuẩn chương trình tiểu học.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => alert('Chức năng nhập câu hỏi')}>➕ Thêm Câu Hỏi Mới</button>
            <button className="btn-secondary" onClick={() => alert('Xem danh mục chuyên đề')}>📂 Quản Lý Chuyên Đề</button>
          </div>
        </div>
      </div>
    </div>
  );
}
