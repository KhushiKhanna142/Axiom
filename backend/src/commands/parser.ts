import { ParsedCommand } from '../types';

export function parseCommand(content: string): ParsedCommand | null {
  if (!content.startsWith('/')) return null;
  const [rawCmd, ...args] = content.slice(1).split(' ');
  return { command: rawCmd.toLowerCase(), args };
}
