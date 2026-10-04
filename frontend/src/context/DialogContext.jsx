import React, { createContext, useContext, useState } from 'react';
import { sound } from '../services/audio';

const DialogContext = createContext(null);

export function DialogProvider({ children }) {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    icon: '📝',
    confirmText: 'Đồng ý',
    cancelText: 'Hủy bỏ',
    type: 'confirm', // 'confirm' or 'alert'
    resolve: null
  });

  const confirm = ({
    title = 'Xác nhận',
    message = '',
    icon = '❓',
    confirmText = 'Đồng ý',
    cancelText = 'Quay lại'
  }) => {
    sound.pop();
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        title,
        message,
        icon,
        confirmText,
        cancelText,
        type: 'confirm',
        resolve
      });
    });
  };

  const alert = ({
    title = 'Thông báo',
    message = '',
    icon = '✨',
    confirmText = 'Đã hiểu'
  }) => {
    sound.pop();
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        title,
        message,
        icon,
        confirmText,
        cancelText: null,
        type: 'alert',
        resolve
      });
    });
  };

  const handleConfirm = () => {
    sound.pop();
    if (dialogState.resolve) dialogState.resolve(true);
    setDialogState(prev => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    sound.pop();
    if (dialogState.resolve) dialogState.resolve(false);
    setDialogState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}

      {/* Modern Dialog Modal Overlay */}
      {dialogState.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '20px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            maxWidth: '440px',
            width: '100%',
            padding: '32px 28px',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '2px solid rgba(226, 232, 240, 0.8)',
            animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {/* Icon Halo */}
            <div style={{
              fontSize: '3rem',
              background: '#EEF2FF',
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px auto',
              border: '2px solid #C7D2FE',
              boxShadow: '0 8px 16px rgba(79, 70, 229, 0.12)'
            }}>
              {dialogState.icon}
            </div>

            {/* Title */}
            <h3 style={{
              fontSize: '1.35rem',
              fontWeight: 900,
              color: '#1E293B',
              marginBottom: '10px',
              letterSpacing: '-0.3px'
            }}>
              {dialogState.title}
            </h3>

            {/* Message */}
            <p style={{
              fontSize: '0.98rem',
              color: '#64748B',
              lineHeight: 1.55,
              fontWeight: 600,
              marginBottom: '26px'
            }}>
              {dialogState.message}
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {dialogState.type === 'confirm' && (
                <button
                  onClick={handleCancel}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    borderRadius: '14px',
                    border: '1.5px solid #E2E8F0',
                    background: '#F8FAFC',
                    color: '#64748B',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {dialogState.cancelText}
                </button>
              )}

              <button
                onClick={handleConfirm}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #4F46E5, #4338CA)',
                  color: 'white',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                {dialogState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export const useDialog = () => useContext(DialogContext);
