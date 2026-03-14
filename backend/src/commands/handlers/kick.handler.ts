import { CommandContext, ROLE_WEIGHT } from '../../types';
import { supabase } from '../../config/supabase';
import { writeAuditEvent } from '../../services/audit.service';

export async function kickHandler(args: string[], ctx: CommandContext): Promise<string> {
  if (ROLE_WEIGHT[ctx.actor.role] < ROLE_WEIGHT['moderator']) {
    return 'You do not have permission for this command.';
  }
  const targetUsername = args[0]?.replace('@', '');
  if (!targetUsername) return 'Usage: /kick @username';

  const { data: target } = await supabase.from('users').select('id, username, role').eq('username', targetUsername).single();
  if (!target) return `User @${targetUsername} not found.`;
  if (target.id === ctx.actor.userId) return 'You cannot kick yourself.';
  if (ROLE_WEIGHT[target.role as keyof typeof ROLE_WEIGHT] >= ROLE_WEIGHT[ctx.actor.role]) {
    return 'You cannot kick a user with equal or higher role.';
  }

  await supabase.from('room_members').delete().eq('room_id', ctx.room.id).eq('user_id', target.id);
  writeAuditEvent({ event: 'KICK', actorId: ctx.actor.userId, targetId: target.id, roomId: ctx.room.id, metadata: { username: target.username } }).catch(() => {});

  ctx.io.to(`user:${target.id}`).emit('room:kicked', { roomId: ctx.room.id });
  return `${target.username} was removed from this room.`;
}
