import { CommandContext, ROLE_WEIGHT } from '../../types';
import { supabase } from '../../config/supabase';
import { writeAuditEvent } from '../../services/audit.service';

export async function createRoomHandler(args: string[], ctx: CommandContext): Promise<string> {
  if (ROLE_WEIGHT[ctx.actor.role] < ROLE_WEIGHT['moderator']) {
    return 'You do not have permission for this command.';
  }
  const rawName = args[0]?.replace('#', '');
  if (!rawName) return 'Usage: /create-room #room-name';
  if (!/^[a-z][a-z0-9-]{2,29}$/.test(rawName)) return 'Room name must be lowercase, 3-30 chars, start with a letter.';

  const { data: existing } = await supabase.from('rooms').select('id').eq('name', rawName).single();
  if (existing) return `Room #${rawName} already exists.`;

  const { data: room } = await supabase.from('rooms').insert({
    name: rawName, created_by: ctx.actor.userId,
  }).select().single();

  if (!room) return 'Failed to create room.';

  await supabase.from('room_members').insert({ room_id: room.id, user_id: ctx.actor.userId, local_role: 'owner' });
  writeAuditEvent({ event: 'ROOM_CREATED', actorId: ctx.actor.userId, targetId: room.id, metadata: { name: rawName } }).catch(() => {});

  ctx.io.emit('room:created', { room });
  return `Room #${rawName} created. You are the owner.`;
}
