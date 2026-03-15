import React from 'react';
import { DirectMessage } from '../../types';

interface DMBubbleProps {
  message: DirectMessage;
  isOwn: boolean;
}

export default function DMBubble({ message, isOwn }: DMBubbleProps) {
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isOwn ? 'flex-end' : 'flex-start',
        gap: 4,
      }}
    >
      <div
        style={{
          maxWidth: '85%',
          padding: '8px 12px',
          borderRadius: 12,
          borderBottomRightRadius: isOwn ? 0 : 12,
          borderBottomLeftRadius: isOwn ? 12 : 0,
          background: isOwn ? 'var(--accent)' : 'var(--bg-elevated)',
          color: isOwn ? '#fff' : 'var(--text-primary)',
          wordBreak: 'break-word',
          fontSize: 14,
          position: 'relative',
        }}
      >
        <span style={{ position: 'absolute', top: -8, right: isOwn ? 'auto' : -8, left: isOwn ? -8 : 'auto', fontSize: 10, background: 'var(--bg-surface)', borderRadius: '50%', padding: 2 }}>
          🔒
        </span>
        {message.decryptedContent ? (
          message.decryptedContent
        ) : (
          <span style={{ fontSize: 13, fontStyle: 'italic', opacity: 0.8 }}>
            (Encrypted message)
          </span>
        )}
      </div>
      <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-geist-mono)' }}>
        {time}
      </span>
    </div>
  );
}
