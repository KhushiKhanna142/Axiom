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
        height: 64, borderBottom: '1px solid var(--border)', background: 'rgba(25, 25, 35, 0.4)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0,
      }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>#{room?.name || '...'}</span>
          {room?.description && (
            <span style={{ marginLeft: 12, fontSize: 13, color: 'var(--text-secondary)' }}>{room.description}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isSuperAdmin && (
            <button onClick={() => setShowAdmin(true)}
              style={{
                fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)',
                background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', cursor: 'pointer',
                transition: 'all 0.2s ease', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
              Admin Options
            </button>
          )}
        </div>
      </div>
      {showAdmin && <AdminPanel roomId={roomId} onClose={() => setShowAdmin(false)} />}
    </>
  );
}
