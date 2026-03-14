'use client';
import { useEffect } from 'react';
import { getSocket } from '../lib/socket';
import { useChatStore } from '../store/chat.store';
import { Message } from '../types';

export function useSocket(roomId?: string) {
  const { addMessage, updatePresence, setTyping } = useChatStore();

  useEffect(() => {
    const socket = getSocket();

    socket.on('message:new', (msg: Message) => addMessage(msg));

    socket.on('system:message', (data: { roomId: string; content: string }) => {
      addMessage({
        id: crypto.randomUUID(),
        roomId: data.roomId,
        content: data.content,
        senderId: 'system',
        senderUsername: 'System',
        senderRole: 'superadmin',
        isCommand: false,
        isSystem: true,
        createdAt: new Date().toISOString(),
      });
    });

    socket.on('presence:update', ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
      updatePresence(userId, isOnline);
    });

    socket.on('typing:update', (data: { roomId: string; userId: string; isTyping: boolean }) => {
      setTyping(data.roomId, { userId: data.userId, username: '' }, data.isTyping);
    });

    socket.on('role:changed', () => window.location.reload());
    socket.on('room:kicked', () => { window.location.href = '/chat'; });

    // Heartbeat every 20 seconds
    const hb = setInterval(() => socket.emit('presence:heartbeat'), 20000);

    return () => {
      ['message:new', 'system:message', 'presence:update', 'typing:update', 'role:changed', 'room:kicked']
        .forEach((e) => socket.off(e));
      clearInterval(hb);
    };
  }, [roomId]);
}
