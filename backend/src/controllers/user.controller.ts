import { Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase';
import { writeAuditEvent } from '../services/audit.service';
import { logger } from '../lib/logger';

const roleSchema = z.object({ role: z.enum(['moderator', 'member']) });

export async function getUsers(req: Request, res: Response): Promise<void> {
  const { data: users } = await supabase.from('users')
    .select('id, username, role, is_online, last_seen').order('username');
  res.status(200).json({ users: users || [] });
}

export async function changeRole(req: Request, res: Response): Promise<void> {
  const { id: targetId } = req.params;
  const actorId = req.user!.userId;
  const parse = roleSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: 'validation_error' });
    return;
  }
  try {
    const { data: target } = await supabase.from('users').select('*').eq('id', targetId).single();
    if (!target) {
      res.status(404).json({ error: 'user_not_found' });
      return;
    }
    if (target.role === 'superadmin') {
      res.status(403).json({ error: 'protected_role', message: 'Superadmin role cannot be changed' });
      return;
    }
    const { role } = parse.data;
    await supabase.from('users').update({ role }).eq('id', targetId);
    writeAuditEvent({
      event: 'ROLE_CHANGE', actorId, targetId,
      metadata: { newRole: role, username: target.username },
    }).catch(() => {});
    res.status(200).json({ message: 'Role updated', role });
    logger.info({ event: 'role.changed', actorId, targetId, role });
  } catch (e) {
    res.status(500).json({ error: 'internal_error' });
  }
}
