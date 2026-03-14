import { CommandContext } from '../../types';
import { supabase } from '../../config/supabase';
import { writeAuditEvent } from '../../services/audit.service';

export async function archiveRoomHandler(_args: string[], ctx: CommandContext): Promise<string> {
  // Check if user is room owner or superadmin
  const { data: membership } = await supabase.from('room_members')
    .select('local_role').eq('room_id', ctx.room.id).eq('user_id', ctx.actor.userId).single();

  if (ctx.actor.role !== 'superadmin' && membership?.local_role !== 'owner') {
    return 'You do not have permission for this command. Only room owners or superadmins can archive rooms.';
  }

  await supabase.from('rooms').update({ is_archived: true }).eq('id', ctx.room.id);
  writeAuditEvent({ event: 'ROOM_ARCHIVED', actorId: ctx.actor.userId, targetId: ctx.room.id, roomId: ctx.room.id, metadata: { name: ctx.room.name } }).catch(() => {});

  return `Room #${ctx.room.name} has been archived.`;
}
