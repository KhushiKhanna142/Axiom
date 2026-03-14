import { CommandContext } from '../../types';
import { supabase } from '../../config/supabase';
import { writeAuditEvent } from '../../services/audit.service';

export async function banHandler(args: string[], ctx: CommandContext): Promise<string> {
  if (ctx.actor.role !== 'superadmin') {
    return 'You do not have permission for this command.';
  }
  const targetUsername = args[0]?.replace('@', '');
  if (!targetUsername) return 'Usage: /ban @username';

  const { data: target } = await supabase.from('users').select('id, username, role').eq('username', targetUsername).single();
  if (!target) return `User @${targetUsername} not found.`;
  if (target.role === 'superadmin') return 'Cannot ban a superadmin.';

  // Remove from all rooms
  await supabase.from('room_members').delete().eq('user_id', target.id);
  writeAuditEvent({ event: 'BAN', actorId: ctx.actor.userId, targetId: target.id, metadata: { username: target.username } }).catch(() => {});

  ctx.io.to(`user:${target.id}`).emit('room:kicked', { roomId: 'all', reason: 'banned' });
  return `${target.username} has been banned from the platform.`;
}
