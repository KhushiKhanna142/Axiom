import { Router } from 'express';
import { register, login, refresh, logout } from '../controllers/auth.controller';

const r = Router();
r.post('/register', register);
r.post('/login', login);
r.post('/refresh', refresh);
r.post('/logout', logout);

export default r;
