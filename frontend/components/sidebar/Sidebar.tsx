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
import RoomList from './RoomList';

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
      <div style={{ width: 260, display: 'flex', flexDirection: 'column', height: '100%',
        background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)', flexShrink: 0 }}>
        {/* Header */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>Axiom</span>
          <OnlineDot online={true} />
        </div>
        
        {/* Room list using new Component */}
        <RoomList
          rooms={rooms}
          activeRoomId={pathname.split('/chat/')[1] || null}
          onRoomSelect={(roomId) => router.push(`/chat/${roomId}`)}
          canCreate={!!canCreate}
          onCreateClick={() => setShowCreate(true)}
        />
        
        {/* User panel */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.username}</div>
            <Badge role={user?.role} />
          </div>
          <button onClick={handleLogout} style={{ fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Out</button>
        </div>
      </div>
      {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} />}
    </>
  );
}
