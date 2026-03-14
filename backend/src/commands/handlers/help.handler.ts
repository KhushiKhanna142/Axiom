import { CommandContext } from '../../types';

export async function helpHandler(_args: string[], ctx: CommandContext): Promise<string> {
  const commands: string[] = [];

  // Member commands
  commands.push('/help — Show this help message');
  commands.push('/online — List online members in this room');
  commands.push('/history [n] — Show last n messages (max 100)');

  // Moderator commands
  if (['moderator', 'superadmin'].includes(ctx.actor.role)) {
    commands.push('/kick @user — Remove a user from this room');
    commands.push('/create-room #name — Create a new room');
    commands.push('/archive-room — Archive the current room');
  }

  // Superadmin commands
  if (ctx.actor.role === 'superadmin') {
    commands.push('/promote @user [role] — Change user global role');
    commands.push('/demote @user — Demote user to member');
    commands.push('/ban @user — Ban user from platform');
    commands.push('/audit — Show last 10 audit events');
  }

  return `Available commands:\n${commands.join('\n')}`;
}
