import { CommandContext, ROLE_WEIGHT } from '../../types';
import { supabase } from '../../config/supabase';
import { writeAuditEvent } from '../../services/audit.service';

export async function promoteHandler(args: string[], ctx: CommandContext): Promise<string> {
  if (ctx.actor.role !== 'superadmin') {
    return 'You do not have permission for this command.';
  }
  const targetUsername = args[0]?.replace('@', '');
  const newRole = args[1];
  if (!targetUsername || !newRole) return 'Usage: /promote @username [moderator|member]';
  if (!['moderator', 'member'].includes(newRole)) return 'Valid roles: moderator, member';

  const { data: target } = await supabase.from('users').select('id, username, role').eq('username', targetUsername).single();
  if (!target) return `User @${targetUsername} not found.`;
  if (target.role === 'superadmin') return 'Superadmin role cannot be changed.';

  await supabase.from('users').update({ role: newRole }).eq('id', target.id);
  writeAuditEvent({ event: 'ROLE_CHANGE', actorId: ctx.actor.userId, targetId: target.id, metadata: { newRole, username: target.username } }).catch(() => {});

  ctx.io.emit('role:changed', { userId: target.id, newRole, username: target.username });
  return `${target.username} is now ${newRole}.`;
}
