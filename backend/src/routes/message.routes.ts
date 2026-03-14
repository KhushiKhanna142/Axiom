import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getMessages, deleteMessage } from '../controllers/message.controller';

const r = Router();
r.use(authMiddleware);
r.get('/rooms/:id/messages', getMessages);
r.delete('/messages/:id', deleteMessage);

export default r;
