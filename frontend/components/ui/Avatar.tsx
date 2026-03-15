import React from 'react';

interface AvatarProps {
  username?: string;
  size?: number;
}

export default function Avatar({ username, size = 28 }: AvatarProps) {
  const initial = username ? username.charAt(0).toUpperCase() : '?';

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.max(10, size / 2.5),
        fontWeight: 600,
        color: '#fff',
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}
