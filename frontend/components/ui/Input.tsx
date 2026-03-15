import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, style, ...props }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--text-secondary)',
            marginBottom: 6,
          }}
        >
          {label}
        </label>
      )}
      <input
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: 8,
          border: error ? '1px solid var(--danger)' : '1px solid var(--border)',
          background: 'var(--bg-elevated)',
          color: 'var(--text-primary)',
          fontSize: 14,
          outline: 'none',
          ...style,
        }}
        {...props}
      />
      {error && (
        <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>
          {error}
        </p>
      )}
    </div>
  );
}
