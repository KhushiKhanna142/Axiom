import { Request, Response, NextFunction } from 'express';
import { GlobalRole, ROLE_WEIGHT } from '../types';

export function requireRole(minGlobalRole: GlobalRole) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'unauthorized', message: 'Authentication required' });
      return;
    }
    if (ROLE_WEIGHT[user.role as GlobalRole] < ROLE_WEIGHT[minGlobalRole]) {
      res.status(403).json({ error: 'forbidden', message: 'Insufficient role' });
      return;
    }
    next();
  };
}
