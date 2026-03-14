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
      <div style={{ width: 280, display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)', flexShrink: 0, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        {/* Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: 18, background: 'linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--primary)))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Axiom
          </span>
          <OnlineDot online={true} />
        </div>

        {/* Room list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 12px 10px' }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>Rooms</span>
            {canCreate && (
              <button onClick={() => setShowCreate(true)}
                style={{ fontSize: 11, fontWeight: 600, color: 'hsl(var(--secondary))', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s ease' }}>
                + NEW
              </button>
            )}
          </div>
          {rooms.map((room) => {
            const active = pathname === `/chat/${room.id}`;
            return (
              <Link key={room.id} href={`/chat/${room.id}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', fontSize: 14, fontWeight: active ? 600 : 500,
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: active ? 'var(--accent-bg)' : 'transparent',
                  borderLeft: active ? '3px solid hsl(var(--primary))' : '3px solid transparent',
                  borderRadius: 6, margin: '2px 0', textDecoration: 'none', transition: 'all 0.2s ease'
                }}>
                <span style={{ opacity: active ? 0.8 : 0.4, color: active ? 'hsl(var(--primary))' : 'inherit' }}>#</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.name}</span>
              </Link>
            );
          })}
        </div>

        {/* User panel */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0, boxShadow: '0 4px 10px rgba(var(--primary), 0.3)' }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.username}</div>
            <Badge role={user?.role} />
          </div>
          <button onClick={handleLogout}
            style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s ease' }}>
            OUT
          </button>
        </div>
      </div>
      {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} />}
    </>
  );
}
