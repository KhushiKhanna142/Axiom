import { CommandContext } from '../../types';
import { supabase } from '../../config/supabase';

export async function historyHandler(args: string[], ctx: CommandContext): Promise<string> {
  const count = Math.min(Math.max(parseInt(args[0]) || 10, 1), 100);

  const { data: messages } = await supabase.from('messages')
    .select('content, created_at, users(username)')
    .eq('room_id', ctx.room.id)
    .order('created_at', { ascending: false })
    .limit(count);

  if (!messages || !messages.length) return 'No messages in this room yet.';

  const lines = messages.reverse().map((m: any) => {
    const time = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const username = (m.users as any)?.username || 'unknown';
    return `[${time}] ${username}: ${m.content}`;
  });

  return `Last ${messages.length} messages:\n${lines.join('\n')}`;
}
