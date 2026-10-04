import React, { createContext, useContext, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = ({ title, message, type = 'success', duration = 4000, icon }) => {
    const id = Date.now() + Math.random();
    const defaultIcon = type === 'success' ? '🎉' : (type === 'error' ? '⚠️' : '💡');
    const toast = { id, title, message, type, icon: icon || defaultIcon };

    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const showSuccess = (title, message) => addToast({ title, message, type: 'success', icon: '🌟' });
  const showError = (title, message) => addToast({ title, message, type: 'error', icon: '⚠️' });
  const showInfo = (title, message) => addToast({ title, message, type: 'info', icon: '💡' });

  return (
    <ToastContext.Provider value={{ addToast, showSuccess, showError, showInfo, removeToast }}>
      {children}
      {/* Toast Container */}
      <div style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '420px',
        width: 'calc(100vw - 48px)',
        pointerEvents: 'none'
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              pointerEvents: 'auto',
              background: t.type === 'success'
                ? 'linear-gradient(135deg, #10B981, #059669)'
                : (t.type === 'error'
                  ? 'linear-gradient(135deg, #EF4444, #DC2626)'
                  : 'linear-gradient(135deg, #4F46E5, #4338CA)'),
              color: 'white',
              padding: '16px 20px',
              borderRadius: '16px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <div style={{
              fontSize: '1.8rem',
              background: 'rgba(255,255,255,0.2)',
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {t.icon}
            </div>

            <div style={{ flex: 1 }}>
              {t.title && (
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, letterSpacing: '-0.2px' }}>
                  {t.title}
                </h4>
              )}
              <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', opacity: 0.95, lineHeight: 1.4 }}>
                {t.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '1.1rem',
                cursor: 'pointer',
                opacity: 0.8,
                padding: '0 4px',
                lineHeight: 1
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
