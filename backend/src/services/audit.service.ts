import { supabase } from '../config/supabase';
import { writeAuditEventToBlockchain } from '../blockchain/service';
import { logger } from '../lib/logger';

interface AuditParams {
  event: string;
  actorId: string;
  targetId?: string;
  roomId?: string;
  metadata?: Record<string, unknown>;
}

export async function writeAuditEvent(params: AuditParams): Promise<void> {
  // Step 1: Write to Postgres immediately
  const { data: row, error } = await supabase.from('audit_log').insert({
    event: params.event,
    actor_id: params.actorId,
    target_id: params.targetId || null,
    room_id: params.roomId || null,
    metadata: params.metadata || null,
    on_chain: false,
  }).select().single();

  if (error) {
    logger.error({ event: 'audit.db_write_failed', error });
    return;
  }

  // Step 2: Blockchain write async — NEVER awaited. Never blocks main flow.
  writeAuditEventToBlockchain(
    params.event,
    params.actorId,
    params.targetId || params.actorId,
    params.metadata || {}
  )
    .then(async (txHash) => {
      if (txHash && row) {
        await supabase.from('audit_log')
          .update({ tx_hash: txHash, on_chain: true }).eq('id', row.id);
        logger.info({ event: 'blockchain.audit.written', txHash, auditEvent: params.event });
      }
    })
    .catch(err => logger.warn({ event: 'blockchain.audit.failed', error: err.message }));
}

export async function getAuditLog(roomId?: string, limit = 20) {
  let q = supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(limit);
  if (roomId) q = q.eq('room_id', roomId);
  const { data } = await q;
  return data || [];
}
