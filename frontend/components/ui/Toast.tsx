import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'info', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: 'var(--success)',
    error: 'var(--danger)',
    info: 'var(--accent)',
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 100,
        background: 'var(--bg-elevated)',
        border: `1px solid ${colors[type]}`,
        borderLeft: `4px solid ${colors[type]}`,
        borderRadius: 8,
        padding: '12px 16px',
        color: 'var(--text-primary)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minWidth: 250,
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: 16,
        }}
      >
        &times;
      </button>
    </div>
  );
}
