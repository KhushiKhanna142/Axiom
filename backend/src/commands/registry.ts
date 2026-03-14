import { ParsedCommand, CommandContext } from '../types';
import { kickHandler } from './handlers/kick.handler';
import { promoteHandler } from './handlers/promote.handler';
import { demoteHandler } from './handlers/demote.handler';
import { banHandler } from './handlers/ban.handler';
import { createRoomHandler } from './handlers/create-room.handler';
import { archiveRoomHandler } from './handlers/archive-room.handler';
import { onlineHandler } from './handlers/online.handler';
import { historyHandler } from './handlers/history.handler';
import { auditHandler } from './handlers/audit.handler';
import { helpHandler } from './handlers/help.handler';

type CommandHandler = (args: string[], ctx: CommandContext) => Promise<string>;

export const COMMANDS: Record<string, CommandHandler> = {
  kick: kickHandler,
  promote: promoteHandler,
  demote: demoteHandler,
  ban: banHandler,
  'create-room': createRoomHandler,
  'archive-room': archiveRoomHandler,
  online: onlineHandler,
  history: historyHandler,
  audit: auditHandler,
  help: helpHandler,
};

export async function executeCommand(parsed: ParsedCommand, ctx: CommandContext): Promise<string> {
  const handler = COMMANDS[parsed.command];
  if (!handler) return 'Unknown command. Type /help for a list.';
  return handler(parsed.args, ctx);
}
