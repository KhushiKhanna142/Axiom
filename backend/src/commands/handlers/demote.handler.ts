import { CommandContext } from '../../types';
import { supabase } from '../../config/supabase';
import { writeAuditEvent } from '../../services/audit.service';

export async function demoteHandler(args: string[], ctx: CommandContext): Promise<string> {
  if (ctx.actor.role !== 'superadmin') {
    return 'You do not have permission for this command.';
  }
  const targetUsername = args[0]?.replace('@', '');
  if (!targetUsername) return 'Usage: /demote @username';

  const { data: target } = await supabase.from('users').select('id, username, role').eq('username', targetUsername).single();
  if (!target) return `User @${targetUsername} not found.`;
  if (target.role === 'superadmin') return 'Superadmin role cannot be changed.';

  await supabase.from('users').update({ role: 'member' }).eq('id', target.id);
  writeAuditEvent({ event: 'ROLE_CHANGE', actorId: ctx.actor.userId, targetId: target.id, metadata: { newRole: 'member', username: target.username } }).catch(() => {});

  ctx.io.emit('role:changed', { userId: target.id, newRole: 'member', username: target.username });
  return `${target.username} has been demoted to member.`;
}
