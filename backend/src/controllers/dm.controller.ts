import { Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase';
import { logger } from '../lib/logger';

const sendDMSchema = z.object({
  ciphertext: z.string().min(1),
  nonce: z.string().min(1),
});

export async function getDMs(req: Request, res: Response): Promise<void> {
  const { recipientId } = req.params;
  const userId = req.user!.userId;
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const before = req.query.before as string | undefined;

  try {
    let q = supabase.from('direct_messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${userId})`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) q = q.lt('created_at', before);
    
    const { data: messages, error } = await q;
    
    if (error) {
      res.status(500).json({ error: 'internal_error', message: error.message });
      return;
    }

    res.status(200).json({ messages: (messages || []).reverse() });
  } catch (e) {
    res.status(500).json({ error: 'internal_error' });
  }
}

export async function sendDM(req: Request, res: Response): Promise<void> {
  const { recipientId } = req.params;
  const senderId = req.user!.userId;
  
  const parse = sendDMSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: 'validation_error', details: parse.error.flatten() });
    return;
  }
  
  const { ciphertext, nonce } = parse.data;

  try {
    // Verify recipient exists
    const { data: recipient } = await supabase.from('users').select('id').eq('id', recipientId).single();
    if (!recipient) {
      res.status(404).json({ error: 'user_not_found', message: 'Recipient does not exist' });
      return;
    }

    const { data: msg, error } = await supabase.from('direct_messages').insert({
      sender_id: senderId,
      recipient_id: recipientId,
      ciphertext,
      nonce,
    }).select().single();

    if (error || !msg) {
      res.status(500).json({ error: 'internal_error' });
      return;
    }

    res.status(201).json({ message: msg });
    logger.info({ event: 'dm.sent', userId: senderId, targetId: recipientId });
  } catch (e) {
    res.status(500).json({ error: 'internal_error' });
  }
}
