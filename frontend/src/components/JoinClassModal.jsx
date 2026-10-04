import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth, mascotMap } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { sound } from '../services/audio';

export default function JoinClassModal({ isOpen, onClose, initialClassCode = '', onSuccess }) {
  const { setUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [classCode, setClassCode] = useState(initialClassCode);
  const [studentName, setStudentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [gradeLevel, setGradeLevel] = useState('2');
  const [selectedAvatar, setSelectedAvatar] = useState('mascot-bear');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialClassCode) {
      setClassCode(initialClassCode.toUpperCase());
      // Try to deduce grade from class code (e.g. 2A1-8429 -> 2, 4A1-5120 -> 4)
      const match = initialClassCode.match(/(\d)/);
      if (match) {
        setGradeLevel(match[1]);
      }
    }
  }, [initialClassCode, isOpen]);

  if (!isOpen) return null;

  const handleClassCodeChange = (e) => {
    const val = e.target.value.toUpperCase();
    setClassCode(val);
    const match = val.match(/(\d)/);
    if (match) {
      setGradeLevel(match[1]);
    }
  };

  const handleJoinClass = async (e) => {
    e.preventDefault();
    sound.pop();

    if (!classCode.trim()) {
      showError('Thiếu Mã Lớp', 'Vui lòng nhập Mã Lớp Học do Thầy/Cô cung cấp (ví dụ: 2A1-8429)!');
      return;
    }

    if (!studentName.trim()) {
      showError('Thiếu Tên Học Sinh', 'Vui lòng nhập đầy đủ Họ và tên học sinh!');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.joinClass({
        class_code: classCode.trim().toUpperCase(),
        student_name: studentName.trim(),
        parent_phone: parentPhone.trim(),
        avatar: selectedAvatar,
        grade_level: parseInt(gradeLevel, 10) || 2
      });

      if (res.success && res.student) {
        sound.fanfare();
        setUser(res.student);
        showSuccess(
          '🎉 Tham Gia Lớp Học Thành Công!',
          `Chào mừng bé "${studentName}" đã gia nhập Mã Lớp ${classCode.toUpperCase()}! Hãy bắt đầu làm bài tập nhé!`
        );

        if (onSuccess) onSuccess(res.student);
        onClose();
      } else {
        showError('Không thể tham gia', 'Có lỗi xảy ra khi kết nối vào lớp học. Vui lòng thử lại!');
      }
    } catch (err) {
      showError('Lỗi kết nối', 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const avatars = [
    { id: 'mascot-bear', label: 'Gấu Chăm Chỉ', icon: '🐻' },
    { id: 'mascot-lion', label: 'Sư Tử Trí Tuệ', icon: '🦁' },
    { id: 'mascot-rabbit', label: 'Thỏ Nhanh Nhẹn', icon: '🐰' },
    { id: 'mascot-fox', label: 'Cáo Sáng Tạo', icon: '🦊' },
    { id: 'mascot-panda', label: 'Gấu Trúc Đáng Yêu', icon: '🐼' }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '16px'
    }}>
      <div className="card" style={{
        maxWidth: '520px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        position: 'relative'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1.5px solid #E2E8F0', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>🏫</span>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1E293B', margin: 0 }}>
                Tham Gia Lớp Học
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                Nhập Mã Lớp của cô giáo để nhận bài tập & bảng điểm
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              color: '#64748B'
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleJoinClass}>
          {/* Class Code Input */}
          <div style={{
            background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
            border: '2px solid #C7D2FE',
            borderRadius: '14px',
            padding: '14px',
            marginBottom: '18px'
          }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 900, color: '#3730A3', marginBottom: '6px' }}>
              🔑 Mã Lớp Học (Do Thầy/Cô cung cấp):
            </label>
            <input
              type="text"
              value={classCode}
              onChange={handleClassCodeChange}
              placeholder="Ví dụ: 2A1-8429, 4A1-5120..."
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '2px solid #6366F1',
                fontSize: '1.1rem',
                fontWeight: 900,
                textAlign: 'center',
                letterSpacing: '2px',
                color: '#312E81',
                background: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.15)'
              }}
              required
            />
          </div>

          {/* Student Full Name */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
              👦 Họ và tên học sinh: <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              value={studentName}
              onChange={e => setStudentName(e.target.value)}
              placeholder="Ví dụ: Bé Lê Hoàng Nam..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.95rem',
                fontWeight: 700
              }}
              required
            />
          </div>

          {/* Parent Phone Number */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
              📱 Số điện thoại Phụ huynh (Nhận kết quả bài làm):
            </label>
            <input
              type="tel"
              value={parentPhone}
              onChange={e => setParentPhone(e.target.value)}
              placeholder="Ví dụ: 0912 345 678..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.95rem',
                fontWeight: 600
              }}
            />
          </div>

          {/* Grade Level */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
              🎓 Khối lớp của bé:
            </label>
            <select
              value={gradeLevel}
              onChange={e => setGradeLevel(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              <option value="1">Lớp 1 🌱</option>
              <option value="2">Lớp 2 🐥</option>
              <option value="3">Lớp 3 🐱</option>
              <option value="4">Lớp 4 🚀</option>
              <option value="5">Lớp 5 👑</option>
            </select>
          </div>

          {/* Mascot / Avatar Choice */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
              🐻 Chọn Linh vật đại diện cho bé:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {avatars.map(av => {
                const isSelected = selectedAvatar === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => { sound.pop(); setSelectedAvatar(av.id); }}
                    style={{
                      background: isSelected ? '#EEF2FF' : '#F8FAFC',
                      border: isSelected ? '2px solid #4F46E5' : '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '8px 4px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: isSelected ? '0 4px 10px rgba(79, 70, 229, 0.2)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: '1.8rem' }}>{av.icon}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: isSelected ? '#4F46E5' : '#64748B' }}>
                      {av.label.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                border: '1.5px solid #CBD5E1',
                background: '#F8FAFC',
                fontWeight: 800,
                cursor: 'pointer',
                color: '#475569'
              }}
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                padding: '12px 28px',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 900,
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)'
              }}
            >
              <span>{isSubmitting ? '⏳ Đang tham gia...' : '🚀 Tham Gia Lớp Ngay'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
