import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { sound } from '../services/audio';

export default function QRCodeModal({ isOpen, onClose, classObj }) {
  const { showSuccess } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !classObj) return null;

  const className = classObj.className || '2A1';
  const classCode = (classObj.class_code || `${className}-8429`).toUpperCase();
  const gradeLevel = classObj.gradeLevel || classObj.grade_level || 2;
  const teacherName = classObj.teacher_name || 'Cô Hoàng Mai';
  
  const origin = window.location.origin || 'https://edukids-livid.vercel.app';
  const joinUrl = `${origin}/?join_class=${encodeURIComponent(classCode)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(joinUrl)}&bgcolor=ffffff&color=1e1b4b&margin=10`;

  const zaloMessage = `🎒 [EDUKIDS - THÔNG BÁO LỚP ${className.toUpperCase()}]
Kính gửi Quý Phụ huynh và các con Lớp ${className},
Cô ${teacherName} gửi Quý Phụ huynh đường link và Mã lớp học trực tuyến trên EduKids:
🔗 Link tham gia lớp: ${joinUrl}
🔑 Mã lớp: ${classCode}

👉 Quý Phụ huynh bấm vào link trên, điền tên bé và SĐT để các con nhận bài tập ôn luyện và bảng điểm của cô nhé! Chúc các con học tốt! ✨`;

  const handleCopyLink = () => {
    sound.pop();
    navigator.clipboard.writeText(joinUrl);
    showSuccess('Đã Sao Chép Link! 📋', 'Đường link tham gia lớp đã được sao chép vào bộ nhớ tạm.');
  };

  const handleCopyCode = () => {
    sound.pop();
    navigator.clipboard.writeText(classCode);
    showSuccess('Đã Sao Chép Mã Lớp! 🔑', `Mã lớp [${classCode}] đã được sao chép.`);
  };

  const handleCopyZaloMessage = () => {
    sound.pop();
    navigator.clipboard.writeText(zaloMessage);
    setCopied(true);
    showSuccess('Đã Sao Chép Mẫu Tin Nhắn! 💬', 'Đã sao chép nội dung tin nhắn gửi Zalo cho phụ huynh!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    sound.pop();
    window.print();
  };

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
        maxWidth: '540px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '28px',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            fontWeight: 900,
            cursor: 'pointer',
            fontSize: '1.1rem',
            color: '#64748B'
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EEF2FF', color: '#4F46E5', padding: '4px 14px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 800, marginBottom: '8px' }}>
            <span>🏫 {teacherName}</span>
            <span>•</span>
            <span>Khối {gradeLevel}</span>
          </div>
          <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#1E293B', margin: 0 }}>
            Mã QR & Link Lớp {className}
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600, marginTop: '4px' }}>
            Gửi mã này vào nhóm Zalo lớp để phụ huynh & học sinh tham gia
          </p>
        </div>

        {/* QR Image Box */}
        <div style={{
          background: 'linear-gradient(135deg, #F8FAFC, #EEF2FF)',
          border: '2px dashed #C7D2FE',
          borderRadius: '18px',
          padding: '20px',
          display: 'inline-block',
          marginBottom: '18px',
          boxShadow: '0 4px 14px rgba(79, 70, 229, 0.08)'
        }}>
          <img
            src={qrUrl}
            alt={`Mã QR Tham Gia Lớp ${className}`}
            style={{ width: '200px', height: '200px', borderRadius: '12px', display: 'block', margin: '0 auto' }}
          />
          <span style={{ display: 'block', marginTop: '8px', fontSize: '0.78rem', color: '#4F46E5', fontWeight: 800 }}>
            📱 Quét mã bằng Zalo hoặc Camera điện thoại
          </span>
        </div>

        {/* Class Code Highlight */}
        <div style={{
          background: '#F5F3FF',
          border: '2px solid #DDD6FE',
          borderRadius: '14px',
          padding: '12px 18px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase' }}>Mã Lớp Học:</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#4C1D95', letterSpacing: '1.5px' }}>
              {classCode}
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            style={{
              background: '#7C3AED',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 14px',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>📋</span>
            <span>Sao Chép Mã</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
          <button
            type="button"
            onClick={handleCopyZaloMessage}
            style={{
              background: 'linear-gradient(135deg, #0068FF, #0088FF)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 18px',
              fontWeight: 900,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(0, 104, 255, 0.3)'
            }}
          >
            <span>💬</span>
            <span>{copied ? '✓ Đã Sao Chép Tin Nhắn Zalo!' : 'Sao Chép Mẫu Tin Nhắn Gửi Phụ Huynh (Zalo)'}</span>
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              onClick={handleCopyLink}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #CBD5E1',
                borderRadius: '10px',
                padding: '10px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                color: '#334155'
              }}
            >
              🔗 Sao Chép Đường Link
            </button>

            <button
              type="button"
              onClick={handlePrint}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #CBD5E1',
                borderRadius: '10px',
                padding: '10px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                color: '#334155'
              }}
            >
              🖨️ In Thẻ Mã QR
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 24px',
            fontWeight: 800,
            fontSize: '0.88rem',
            color: '#64748B',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Đóng Lại
        </button>
      </div>
    </div>
  );
}
