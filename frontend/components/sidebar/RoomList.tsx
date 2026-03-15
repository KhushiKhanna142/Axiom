import React from 'react';
import { Room } from '../../types';
import RoomItem from './RoomItem';

interface RoomListProps {
  rooms: Room[];
  activeRoomId: string | null;
  onRoomSelect: (roomId: string) => void;
  canCreate: boolean;
  onCreateClick: () => void;
}

export default function RoomList({
  rooms,
  activeRoomId,
  onRoomSelect,
  canCreate,
  onCreateClick,
}: RoomListProps) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 16px 6px',
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
          }}
        >
          Rooms
        </span>
        {canCreate && (
          <button
            onClick={onCreateClick}
            style={{
              fontSize: 11,
              color: 'var(--accent)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            + New
          </button>
        )}
      </div>
      {rooms.map((room) => (
        <RoomItem
          key={room.id}
          room={room}
          isActive={activeRoomId === room.id}
          onClick={() => onRoomSelect(room.id)}
        />
      ))}
    </div>
  );
}
