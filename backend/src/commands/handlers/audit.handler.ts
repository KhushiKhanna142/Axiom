import { CommandContext } from '../../types';
import { getAuditLog } from '../../services/audit.service';

export async function auditHandler(_args: string[], ctx: CommandContext): Promise<string> {
  if (ctx.actor.role !== 'superadmin') {
    return 'You do not have permission for this command.';
  }

  const events = await getAuditLog(undefined, 10);
  if (!events.length) return 'No audit events yet.';

  const lines = events.map((e: any) => {
    const time = new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const txInfo = e.tx_hash ? ` [tx: ${e.tx_hash.slice(0, 10)}...]` : ' [pending]';
    return `[${time}] ${e.event}${txInfo}`;
  });

  return `Last ${events.length} audit events:\n${lines.join('\n')}`;
}
