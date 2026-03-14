'use client';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { useChatStore } from '../../../store/chat.store';
import { getSocket } from '../../../lib/socket';
import MessageList from '../../../components/chat/MessageList';
import MessageInput from '../../../components/chat/MessageInput';
import RoomHeader from '../../../components/chat/RoomHeader';
import { useSocket } from '../../../hooks/useSocket';

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { setMessages, setActiveRoom, rooms } = useChatStore();
  const room = rooms.find((r) => r.id === roomId);

  useSocket(roomId);

  useEffect(() => {
    setActiveRoom(roomId);
    const socket = getSocket();
    socket.emit('room:join', { roomId });
    return () => {
      socket.emit('room:leave', { roomId });
      setActiveRoom(null);
    };
  }, [roomId]);

  useQuery({
    queryKey: ['messages', roomId],
    queryFn: async () => {
      const { data } = await api.get(`/rooms/${roomId}/messages`);
      setMessages(roomId, data.messages);
      return data.messages;
    },
    enabled: !!roomId,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <RoomHeader room={room} roomId={roomId} />
      <MessageList roomId={roomId} />
      <MessageInput roomId={roomId} />
    </div>
  );
}
