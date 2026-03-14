import { Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase';
import { writeAuditEvent } from '../services/audit.service';
import { logger } from '../lib/logger';

const createRoomSchema = z.object({
  name: z.string().min(3).max(30).regex(/^[a-z][a-z0-9-]{2,29}$/),
  description: z.string().max(256).optional(),
  isPrivate: z.boolean().optional().default(false),
});

export async function createRoom(req: Request, res: Response): Promise<void> {
  const parse = createRoomSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: 'validation_error', details: parse.error.flatten() });
    return;
  }
  const { name, description, isPrivate } = parse.data;
  const userId = req.user!.userId;
  try {
    const { data: existing } = await supabase.from('rooms').select('id').eq('name', name).single();
    if (existing) {
      res.status(409).json({ error: 'conflict', message: 'Room name already taken' });
      return;
    }
    const { data: room, error } = await supabase.from('rooms')
      .insert({ name, description, is_private: isPrivate, created_by: userId }).select().single();
    if (error || !room) {
      res.status(500).json({ error: 'internal_error' });
      return;
    }
    await supabase.from('room_members').insert({ room_id: room.id, user_id: userId, local_role: 'owner' });
    writeAuditEvent({ event: 'ROOM_CREATED', actorId: userId, targetId: room.id, metadata: { name } }).catch(() => {});
    res.status(201).json({ room });
    logger.info({ event: 'room.created', userId, roomId: room.id });
  } catch (e) {
    res.status(500).json({ error: 'internal_error' });
  }
}

export async function getRooms(req: Request, res: Response): Promise<void> {
  try {
    const { data: rooms } = await supabase.from('rooms')
      .select('*').eq('is_archived', false);
    res.status(200).json({ rooms: rooms || [] });
  } catch (e) {
    res.status(500).json({ error: 'internal_error' });
  }
}

export async function joinRoom(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = req.user!.userId;
  try {
    const { data: room } = await supabase.from('rooms').select('*').eq('id', id).single();
    if (!room) {
      res.status(404).json({ error: 'room_not_found', message: 'Room does not exist' });
      return;
    }
    if (room.is_archived) {
      res.status(410).json({ error: 'room_archived', message: 'Room is archived' });
      return;
    }
    await supabase.from('room_members').upsert(
      { room_id: id, user_id: userId, local_role: 'member' },
      { onConflict: 'room_id,user_id' }
    );
    res.status(200).json({ message: 'Joined room' });
  } catch (e) {
    res.status(500).json({ error: 'internal_error' });
  }
}

export async function getRoomMembers(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    const { data: members } = await supabase.from('room_members')
      .select('local_role, joined_at, users(id, username, role, is_online)').eq('room_id', id);
    res.status(200).json({ members: members || [] });
  } catch (e) {
    res.status(500).json({ error: 'internal_error' });
  }
}
