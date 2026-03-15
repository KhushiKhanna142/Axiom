import React from 'react';
import Link from 'next/link';
import { Room } from '../../types';

interface RoomItemProps {
  room: Room;
  isActive: boolean;
  onClick?: () => void;
}

export default function RoomItem({ room, isActive, onClick }: RoomItemProps) {
  return (
    <Link
      href={`/chat/${room.id}`}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 16px',
        fontSize: 14,
        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
        background: isActive ? 'var(--accent-bg)' : 'transparent',
        borderRadius: 6,
        margin: '1px 8px',
        textDecoration: 'none',
      }}
    >
      <span style={{ opacity: 0.4 }}>#</span>
      <span
        style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {room.name}
      </span>
      {isActive && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--accent)',
            marginLeft: 'auto',
          }}
        />
      )}
    </Link>
  );
}
