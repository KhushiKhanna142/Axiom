'use client';
import { useEffect } from 'react';
import { getSocket } from '../lib/socket';
import { useChatStore } from '../store/chat.store';
import { useAuthStore } from '../store/auth.store';
import { Message, DirectMessage } from '../types';

export function useSocket(roomId?: string) {
  const { addMessage, addDirectMessage, updatePresence, setTyping } = useChatStore();
  const { user } = useAuthStore();

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
    
    socket.on('message:dm:new', (msg: DirectMessage) => {
      // Set the partner ID so the store correctly routes to the user's conversation thread
      const partnerId = msg.senderId === user?.id ? msg.recipientId : msg.senderId;
      addDirectMessage({ ...msg, senderId: partnerId }); // Keep routing simple using senderId as partnerId for the store abstraction
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
      ['message:new','system:message','message:dm:new','presence:update','typing:update','role:changed','room:kicked']
        .forEach((e) => socket.off(e));
      clearInterval(hb);
    };
  }, [roomId]);
}
