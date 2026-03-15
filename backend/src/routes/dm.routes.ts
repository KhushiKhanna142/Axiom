import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getDMs, sendDM } from '../controllers/dm.controller';

const r = Router();
r.use(authMiddleware);

r.get('/:recipientId', getDMs);
r.post('/:recipientId', sendDM);

export default r;
