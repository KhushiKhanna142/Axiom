import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/permission.middleware';
import { createRoom, getRooms, joinRoom, getRoomMembers } from '../controllers/room.controller';

const r = Router();
r.use(authMiddleware);
r.get('/', getRooms);
r.post('/', requireRole('moderator'), createRoom);
r.post('/:id/join', joinRoom);
r.get('/:id/members', getRoomMembers);

export default r;
