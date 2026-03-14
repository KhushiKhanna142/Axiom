import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../crypto/tokens';
import { JwtPayload } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'unauthorized', message: 'Authentication required' });
    return;
  }
  try {
    req.user = verifyAccessToken(header.split(' ')[1]);
    next();
  } catch (e: unknown) {
    const expired = e instanceof Error && e.name === 'TokenExpiredError';
    res.status(401).json({
      error: expired ? 'token_expired' : 'unauthorized',
      message: expired ? 'Session expired. Please log in again' : 'Invalid token'
    });
  }
}
