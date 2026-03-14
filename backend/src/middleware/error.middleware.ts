import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';

export function errorMiddleware(err: AppError, req: Request, res: Response, _next: NextFunction) {
  const status = err.status || 500;
  const code = err.code || 'internal_error';
  const message = err.message || 'Something went wrong';
  logger.error({ event: 'request.error', status, code, path: req.path, userId: req.user?.userId, message });
  res.status(status).json({ error: code, message, requestId: (req as any).id });
}
