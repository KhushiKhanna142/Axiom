'use client';
import { useState } from 'react';
import { useAuthStore } from '../../store/auth.store';
import AdminPanel from '../admin/AdminPanel';
import { Room } from '../../types';

export default function RoomHeader({ room, roomId }: { room?: Room; roomId: string }) {
  const { user } = useAuthStore();
  const [showAdmin, setShowAdmin] = useState(false);
  const isSuperAdmin = user?.role === 'superadmin';

  return (
    <>
      <div style={{
        height: 52, borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0,
      }}>
        <div>
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>#{room?.name || '...'}</span>
          {room?.description && (
            <span style={{ marginLeft: 12, fontSize: 13, color: 'var(--text-secondary)' }}>{room.description}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isSuperAdmin && (
            <button onClick={() => setShowAdmin(true)}
              style={{
                fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)',
                background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
              }}>
              Admin
            </button>
          )}
        </div>
      </div>
      {showAdmin && <AdminPanel roomId={roomId} onClose={() => setShowAdmin(false)} />}
    </>
  );
}
