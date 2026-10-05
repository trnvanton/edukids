import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      background: 'white',
      borderTop: '2px solid var(--border-color)',
      padding: '50px 0 30px 0',
      marginTop: 'auto',
      color: '#475569'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '32px',
          marginBottom: '40px'
        }}>
          {/* Col 1: Brand & Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                fontSize: '1.8rem',
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                🎒
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--primary)', margin: 0 }}>
                EduKids
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-muted)' }}>
              Nền tảng học tập trực tuyến thông minh theo phương pháp Gamification dành riêng cho học sinh Tiểu Học từ Lớp 1 đến Lớp 5.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px', fontSize: '1.4rem' }}>
              <span>🐻</span>
              <span>🦁</span>
              <span>🐰</span>
              <span>🦊</span>
              <span>🐼</span>
            </div>
          </div>

          {/* Col 2: Subjects Directory */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#1E293B', marginBottom: '14px' }}>
              📚 Môn Học Trọng Tâm
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.88rem', lineHeight: 2 }}>
              <li>📐 <strong>Toán Học:</strong> Số học, Hình học & Logic</li>
              <li>📖 <strong>Tiếng Việt:</strong> Đọc hiểu, Từ ngữ & Tập làm văn</li>
              <li>🇬🇧 <strong>Tiếng Anh:</strong> Từ vựng, Ngữ pháp & Nghe nói</li>
              <li>🔬 <strong>Khoa Học:</strong> Tự nhiên & Xã hội quanh ta</li>
            </ul>
          </div>

          {/* Col 3: Grade Levels */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#1E293B', marginBottom: '14px' }}>
              🏫 Khối Lớp Học Tập
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.88rem', lineHeight: 2 }}>
              <li>🌱 <strong>Khối Lớp 1:</strong> Bảng chữ cái, số đếm 0-100</li>
              <li>🐥 <strong>Khối Lớp 2:</strong> Bảng nhân chia 2, 5 & cộng có nhớ</li>
              <li>🐱 <strong>Khối Lớp 3:</strong> Bảng cửu chương & chu vi diện tích</li>
              <li>🚀 <strong>Khối Lớp 4:</strong> Phân số, góc học & từ loại</li>
              <li>👑 <strong>Khối Lớp 5:</strong> Số thập phân & ôn thi chuyển cấp</li>
            </ul>
          </div>

          {/* Col 4: Platform Highlights */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#1E293B', marginBottom: '14px' }}>
              🌟 Tính Năng Nổi Bật
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.88rem', lineHeight: 2 }}>
              <li>🎯 Lời giải sư phạm chi tiết từng câu</li>
              <li>⭐ Tích lũy XP thăng hạng & mở khóa huy hiệu</li>
              <li>👩‍🏫 Bảng điểm & quản lý lớp dành cho giáo viên</li>
              <li>🏆 Bảng vàng vinh danh học sinh xuất sắc</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            © {new Date().getFullYear()} <strong>EduKids Vietnam</strong> • Đồng hành cùng tri thức & niềm vui tuổi thơ ❤️
          </div>
          <div>
            📧 Email hỗ trợ: <strong><a href="mailto:trinhvantoanwork63@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>trinhvantoanwork63@gmail.com</a></strong>
          </div>
        </div>
      </div>
    </footer>
  );
}
