import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export async function getMessages(req: Request, res: Response): Promise<void> {
  const { id: roomId } = req.params;
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const before = req.query.before as string | undefined;
  try {
    let q = supabase.from('messages')
      .select('id, content, is_command, is_system, created_at, edited_at, deleted_at, sender_id, users!messages_sender_id_fkey(id, username, role)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (before) q = q.lt('created_at', before);
    const { data: messages } = await q;
    res.status(200).json({ messages: (messages || []).reverse() });
  } catch (e) {
    res.status(500).json({ error: 'internal_error' });
  }
}

export async function deleteMessage(req: Request, res: Response): Promise<void> {
  const { id: msgId } = req.params;
  const userId = req.user!.userId;
  try {
    const { data: msg } = await supabase.from('messages').select('*').eq('id', msgId).single();
    if (!msg) {
      res.status(404).json({ error: 'not_found', message: 'Message not found' });
      return;
    }
    const isOwn = msg.sender_id === userId;
    const isMod = ['moderator', 'superadmin'].includes(req.user!.role);
    if (!isOwn && !isMod) {
      res.status(403).json({ error: 'forbidden', message: 'Cannot delete this message' });
      return;
    }
    await supabase.from('messages').update({ deleted_at: new Date().toISOString() }).eq('id', msgId);
    res.status(200).json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ error: 'internal_error' });
  }
}
