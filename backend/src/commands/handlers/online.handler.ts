import { CommandContext } from '../../types';
import { supabase } from '../../config/supabase';
import { getOnlineBatch } from '../../services/presence.service';

export async function onlineHandler(_args: string[], ctx: CommandContext): Promise<string> {
  const { data: members } = await supabase.from('room_members')
    .select('user_id, users(username)').eq('room_id', ctx.room.id);

  if (!members || !members.length) return 'No members in this room.';

  const userIds = members.map((m: any) => m.user_id);
  const onlineMap = await getOnlineBatch(userIds);

  const onlineUsers = members
    .filter((m: any) => onlineMap[m.user_id])
    .map((m: any) => (m.users as any)?.username || 'unknown');

  if (!onlineUsers.length) return 'No users are currently online in this room.';
  return `Online in #${ctx.room.name}: ${onlineUsers.join(', ')} (${onlineUsers.length} total)`;
}
