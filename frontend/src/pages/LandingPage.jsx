import React from 'react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../services/audio';

export default function LandingPage() {
  const { openLogin, openRegister, login } = useAuth();

  const gradeList = [
    { grade: 1, icon: '🌱', name: 'Lớp 1', desc: 'Làm quen bảng chữ cái, nhận biết số đếm 0-100 & phép cộng trừ cơ bản.' },
    { grade: 2, icon: '🐥', name: 'Lớp 2', desc: 'Phép cộng trừ có nhớ, bảng nhân chia 2 & 5, hình học phẳng.' },
    { grade: 3, icon: '🐱', name: 'Lớp 3', desc: 'Bảng cửu chương toàn diện, tính chu vi diện tích, đọc hiểu diễn cảm.' },
    { grade: 4, icon: '🚀', name: 'Lớp 4', desc: 'Phân số, rút gọn quy đồng, hình bình hành, luyện từ và câu nâng cao.' },
    { grade: 5, icon: '👑', name: 'Lớp 5', desc: 'Số thập phân, tỉ số phần trăm, diện tích tam giác, ôn thi chuyển cấp.' }
  ];

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #EC4899 100%)',
        color: 'white',
        padding: '60px 20px',
        borderRadius: '0 0 32px 32px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px -15px rgba(79, 70, 229, 0.3)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(8px)',
            padding: '8px 18px',
            borderRadius: '9999px',
            fontSize: '0.9rem',
            fontWeight: 800,
            marginBottom: '20px'
          }}>
            <span>✨ Nền Tảng Học Tập Gamification Hàng Đầu Cho Học Sinh Tiểu Học</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 900,
            lineHeight: 1.2,
            marginBottom: '18px',
            letterSpacing: '-0.5px'
          }}>
            Học Vui Mỗi Ngày, Chinh Phục Điểm 10 Cùng <span style={{ color: '#FDE047' }}>EduKids</span>! 🎒
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            opacity: 0.95,
            maxWidth: '650px',
            margin: '0 auto 30px auto',
            lineHeight: 1.6
          }}>
            Hệ thống bài giảng & trắc nghiệm thông minh từ <strong>Lớp 1 đến Lớp 5</strong>. Giải thích chi tiết từng câu, tích lũy XP thăng cấp, bảng vàng vinh danh và đổi bạn linh vật ngộ nghĩnh!
          </p>

          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => { sound.pop(); openRegister(); }}
              className="btn-primary"
              style={{
                background: '#FDE047',
                color: '#1E1B4B',
                fontSize: '1.1rem',
                padding: '16px 32px',
                fontWeight: 900,
                boxShadow: '0 10px 25px rgba(253, 224, 71, 0.4)'
              }}
            >
              <span>⭐ Đăng Ký Tài Khoản & Chọn Lớp Ngay</span>
            </button>

            <button
              onClick={() => { sound.pop(); openLogin(); }}
              className="btn-secondary"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                fontSize: '1.1rem',
                padding: '16px 28px',
                fontWeight: 800,
                backdropFilter: 'blur(6px)'
              }}
            >
              <span>🔑 Đăng Nhập Tài Khoản</span>
            </button>
          </div>
        </div>
      </section>

      {/* Grade Level Selector Showcase */}
      <section className="container" style={{ marginTop: '50px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900 }}>
            🏫 Chương Trình Học Chuẩn Bộ Giáo Dục Phân Theo Khối Lớp
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '6px' }}>
            Khi đăng ký, bé chỉ cần chọn Khối Lớp của mình. Hệ thống sẽ tự động khóa bài tập đúng độ tuổi và cho phép nâng cấp lớp sau mỗi năm học!
          </p>
        </div>

        <div className="grid-3" style={{ gap: '20px' }}>
          {gradeList.map(g => (
            <div
              key={g.grade}
              className="card"
              style={{
                textAlign: 'left',
                border: '2px solid var(--border-color)',
                transition: 'var(--transition)',
                cursor: 'pointer'
              }}
              onClick={() => { sound.pop(); openRegister(); }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{g.icon}</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '8px' }}>
                Khối {g.name}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
                {g.desc}
              </p>
              <button
                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '10px',
                  fontSize: '0.9rem'
                }}
              >
                <span>Vào Học Khối {g.name} 🚀</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3 User Types Section */}
      <section className="container" style={{ marginTop: '60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900 }}>
            👥 Thiết Kế Dành Riêng Cho Cả Học Sinh, Giáo Viên & Phụ Huynh
          </h2>
        </div>

        <div className="grid-3" style={{ gap: '24px' }}>
          {/* Student */}
          <div className="card" style={{ background: '#EEF2FF', border: '2px solid #C7D2FE' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>👦</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#3730A3', marginBottom: '10px' }}>
              Dành Cho Học Sinh
            </h3>
            <ul style={{ fontSize: '0.9rem', color: '#4338CA', lineHeight: 1.8, paddingLeft: '20px', fontWeight: 600 }}>
              <li>Chọn khối lớp & bài học phù hợp</li>
              <li>Làm bài tập trắc nghiệm & nhận chấm điểm ngay</li>
              <li>Xem lời giải thích từng câu chi tiết</li>
              <li>Tích lũy XP, thăng hạng Level & đổi Mascot</li>
              <li>Theo dõi chuỗi ngày học liên tục (Streak)</li>
            </ul>
          </div>

          {/* Teacher */}
          <div className="card" style={{ background: '#FEF3C7', border: '2px solid #FDE68A' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>👩‍🏫</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#92400E', marginBottom: '10px' }}>
              Dành Cho Giáo Viên
            </h3>
            <ul style={{ fontSize: '0.9rem', color: '#B45309', lineHeight: 1.8, paddingLeft: '20px', fontWeight: 600 }}>
              <li>Quản lý danh sách học sinh theo lớp (Ví dụ: 4A1)</li>
              <li>Xem bảng điểm chi tiết từng học sinh</li>
              <li>Cảnh báo học sinh học yếu (&lt; 7.0 điểm) để kịp thời hỗ trợ</li>
              <li>Tạo bài tập, câu hỏi & lời giải sư phạm</li>
              <li>Giao bài tập về nhà theo lớp</li>
            </ul>
          </div>

          {/* Admin */}
          <div className="card" style={{ background: '#ECFDF5', border: '2px solid #A7F3D0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>👨‍💼</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#065F46', marginBottom: '10px' }}>
              Quản Trị Hệ Thống
            </h3>
            <ul style={{ fontSize: '0.9rem', color: '#047857', lineHeight: 1.8, paddingLeft: '20px', fontWeight: 600 }}>
              <li>Theo dõi tổng số học sinh, giáo viên & bài tập</li>
              <li>Quản lý ngân hàng câu hỏi & cây môn học</li>
              <li>Đảm bảo hệ thống vận hành mượt mà</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Quick Demo CTA */}
      <section className="container" style={{ marginTop: '50px', textAlign: 'center' }}>
        <div className="card" style={{
          padding: '36px',
          background: 'white',
          border: '2px dashed var(--primary)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '10px' }}>
            🚀 Trải Nghiệm Nhanh Hệ Thống Với Tài Khoản Mẫu:
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.95rem' }}>
            Bấm 1 chạm để đăng nhập trực tiếp thử nghiệm:
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => { sound.pop(); login('student1', '123456'); }}
              className="btn-primary"
              style={{ padding: '12px 20px', fontSize: '0.95rem' }}
            >
              <span>👦 Vào Thử: Bé Minh Anh (Học Sinh Lớp 4)</span>
            </button>
            <button
              onClick={() => { sound.pop(); login('student_lop2', '123456'); }}
              className="btn-secondary"
              style={{ padding: '12px 20px', fontSize: '0.95rem', background: '#ECFDF5', color: '#065F46', border: '1.5px solid #A7F3D0' }}
            >
              <span>🐥 Vào Thử: Bé Bảo Ngọc (Học Sinh Lớp 2)</span>
            </button>
            <button
              onClick={() => { sound.pop(); login('teacher1', '123456'); }}
              className="btn-secondary"
              style={{ padding: '12px 20px', fontSize: '0.95rem', background: '#FEF3C7', color: '#92400E', border: '1.5px solid #FDE68A' }}
            >
              <span>👩‍🏫 Vào Thử: Cô Hoàng Mai (Giáo Viên)</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
