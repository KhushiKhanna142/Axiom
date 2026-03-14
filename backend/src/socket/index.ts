import { Server } from 'socket.io';
import { verifyAccessToken } from '../crypto/tokens';
import { setOnline, setOffline, heartbeat } from '../services/presence.service';
import { supabase } from '../config/supabase';
import { parseCommand, executeCommand } from '../commands';
import { logger } from '../lib/logger';
import { env } from '../config/env';

export function initSocket(httpServer: any) {
  const io = new Server(httpServer, {
    cors: {
      origin: [env.FRONTEND_URL, /\.vercel\.app$/],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Auth middleware — runs before any event
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('unauthorized'));
    try {
      socket.data.user = verifyAccessToken(token);
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });

  io.on('connection', async (socket) => {
    const user = socket.data.user;
    logger.info({ event: 'socket.connected', userId: user.userId });
    await setOnline(user.userId, socket.id);
    io.emit('presence:update', { userId: user.userId, isOnline: true });
    socket.join(`user:${user.userId}`); // Personal room for DMs

    socket.on('room:join', async ({ roomId }) => {
      try {
        const { data: member } = await supabase.from('room_members')
          .select('id').eq('room_id', roomId).eq('user_id', user.userId).single();
        if (!member) {
          socket.emit('error', { code: 'not_member', message: 'Join room via API first' });
          return;
        }
        socket.join(roomId);
        io.to(roomId).emit('room:user_joined', {
          roomId,
          user: { id: user.userId, username: user.username, role: user.role },
        });
        logger.info({ event: 'room.joined', userId: user.userId, roomId });
      } catch (e: any) {
        socket.emit('error', { code: 'internal_error', message: e.message });
      }
    });

    socket.on('room:leave', ({ roomId }) => {
      socket.leave(roomId);
      io.to(roomId).emit('room:user_left', { roomId, userId: user.userId });
    });

    socket.on('message:send', async ({ roomId, content }) => {
      const start = Date.now();
      try {
        if (!content || content.trim().length === 0) return;
        if (content.length > 4000) {
          socket.emit('error', { code: 'message_too_long', message: 'Message exceeds 4000 character limit' });
          return;
        }
        const cleanContent = content.replace(/\0/g, '').trim();

        // Verify membership
        const { data: member } = await supabase.from('room_members')
          .select('id').eq('room_id', roomId).eq('user_id', user.userId).single();
        if (!member) {
          socket.emit('error', { code: 'not_member' });
          return;
        }

        // Command routing
        const parsed = parseCommand(cleanContent);
        if (parsed) {
          const { data: room } = await supabase.from('rooms').select('*').eq('id', roomId).single();
          if (!room) {
            socket.emit('error', { code: 'room_not_found' });
            return;
          }
          const result = await executeCommand(parsed, { actor: user, room, socket, io });
          if (result) io.to(roomId).emit('system:message', { roomId, content: result, type: 'command' });
          return;
        }

        // Store message
        const { data: msg } = await supabase.from('messages').insert({
          room_id: roomId,
          sender_id: user.userId,
          content: cleanContent,
          is_command: false,
        }).select().single();
        if (!msg) {
          socket.emit('error', { code: 'internal_error' });
          return;
        }

        // Broadcast to room
        io.to(roomId).emit('message:new', {
          id: msg.id,
          roomId,
          content: msg.content,
          senderId: user.userId,
          senderUsername: user.username,
          senderRole: user.role,
          createdAt: msg.created_at,
          isCommand: false,
          isSystem: false,
        });

        logger.info({ event: 'message.sent', userId: user.userId, roomId, latencyMs: Date.now() - start });
      } catch (e: any) {
        socket.emit('error', { code: 'internal_error', message: e.message });
      }
    });

    socket.on('message:delete', async ({ messageId }) => {
      try {
        await supabase.from('messages').update({ deleted_at: new Date().toISOString() }).eq('id', messageId);
        const { data: msg } = await supabase.from('messages').select('room_id').eq('id', messageId).single();
        if (msg) io.to(msg.room_id).emit('message:deleted', { messageId, roomId: msg.room_id });
      } catch (e: any) {
        socket.emit('error', { code: 'internal_error', message: e.message });
      }
    });

    socket.on('typing:start', ({ roomId }) => {
      socket.to(roomId).emit('typing:update', { roomId, userId: user.userId, isTyping: true });
    });

    socket.on('typing:stop', ({ roomId }) => {
      socket.to(roomId).emit('typing:update', { roomId, userId: user.userId, isTyping: false });
    });

    socket.on('presence:heartbeat', async () => {
      await heartbeat(user.userId);
    });

    socket.on('disconnect', async () => {
      await setOffline(user.userId);
      io.emit('presence:update', { userId: user.userId, isOnline: false });
      logger.info({ event: 'socket.disconnected', userId: user.userId });
    });
  });

  return io;
}
