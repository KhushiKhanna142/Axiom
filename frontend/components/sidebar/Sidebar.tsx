'use client';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/auth.store';
import { useChatStore } from '../../store/chat.store';
import Badge from '../ui/Badge';
import OnlineDot from './OnlineDot';
import CreateRoomModal from '../admin/CreateRoomModal';

export default function Sidebar() {
  const { user, clearAuth } = useAuthStore();
  const { rooms, setRooms } = useChatStore();
  const [showCreate, setShowCreate] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const canCreate = user && ['moderator', 'superadmin'].includes(user.role);

  useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data } = await api.get('/rooms');
      setRooms(data.rooms);
      return data.rooms;
    },
    refetchInterval: 30000,
  });

  const handleLogout = async () => {
    await api.post('/auth/logout').catch(() => {});
    clearAuth();
    router.push('/login');
  };

  return (
    <>
      <div style={{ width: 260, display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)', flexShrink: 0 }}>
        {/* Header */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>Axiom</span>
          <OnlineDot online={true} />
        </div>

        {/* Room list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 16px 6px' }}>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Rooms</span>
            {canCreate && (
              <button onClick={() => setShowCreate(true)}
                style={{ fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
                + New
              </button>
            )}
          </div>
          {rooms.map((room) => {
            const active = pathname === `/chat/${room.id}`;
            return (
              <Link key={room.id} href={`/chat/${room.id}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '5px 16px', fontSize: 14,
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: active ? 'var(--accent-bg)' : 'transparent',
                  borderRadius: 6, margin: '1px 8px', textDecoration: 'none',
                }}>
                <span style={{ opacity: 0.4 }}>#</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.name}</span>
              </Link>
            );
          })}
        </div>

        {/* User panel */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.username}</div>
            <Badge role={user?.role} />
          </div>
          <button onClick={handleLogout}
            style={{ fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            Out
          </button>
        </div>
      </div>
      {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} />}
    </>
  );
}
