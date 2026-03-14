import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/permission.middleware';
import { getUsers, changeRole } from '../controllers/user.controller';
import { getAuditLog } from '../services/audit.service';
import { getAuditTrailFromChain } from '../blockchain/service';
import { supabase } from '../config/supabase';

const r = Router();
r.use(authMiddleware);
r.get('/me', (req, res) => res.json({ user: req.user }));
r.get('/', requireRole('moderator'), getUsers);
r.patch('/:id/role', requireRole('superadmin'), changeRole);
r.get('/search', async (req, res) => {
  const q = req.query.q as string;
  const { data } = await supabase.from('users')
    .select('id, username, role, public_key')
    .ilike('username', `%${q}%`)
    .limit(10);
  res.json({ users: data || [] });
});
r.get('/audit', requireRole('moderator'), async (req, res) => {
  const events = await getAuditLog(req.query.roomId as string | undefined, 50);
  res.json({ events });
});
r.get('/audit/chain', requireRole('superadmin'), async (_req, res) => {
  const events = await getAuditTrailFromChain(20);
  res.json({ events });
});

export default r;
