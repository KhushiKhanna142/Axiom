import 'dotenv/config';
import './config/env';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import requestId from 'express-request-id';
import { rateLimit } from 'express-rate-limit';
import { env } from './config/env';
import { logger } from './lib/logger';
import { errorMiddleware } from './middleware/error.middleware';
import { initSocket } from './socket';
import authRoutes from './routes/auth.routes';
import roomRoutes from './routes/room.routes';
import messageRoutes from './routes/message.routes';
import userRoutes from './routes/user.routes';
import dmRoutes from './routes/dm.routes';

const app = express();
const server = http.createServer(app);

app.set('trust proxy', 1);
app.use(requestId());
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || origin === env.FRONTEND_URL || /\.vercel\.app$/.test(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(rateLimit({ windowMs: 60000, max: 100, standardHeaders: true, legacyHeaders: false }));

app.get('/api/health', async (_, res) => {
  const { redis } = await import('./redis/client');
  const { supabase } = await import('./config/supabase');
  const { contract } = await import('./blockchain/service');
  const [redisOk, dbOk, chainOk] = await Promise.allSettled([
    redis.ping().then(() => true),
    supabase.from('users').select('id').limit(1).then(() => true),
    (contract as any).getEventCount().then(() => true),
  ]);
  res.json({
    status: 'ok',
    redis: redisOk.status === 'fulfilled' ? 'ok' : 'error',
    database: dbOk.status === 'fulfilled' ? 'ok' : 'error',
    blockchain: chainOk.status === 'fulfilled' ? 'ok' : 'error',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dms', dmRoutes);

app.use(errorMiddleware);

const io = initSocket(server);

const PORT = parseInt(env.PORT, 10);
server.listen(PORT, () => logger.info({ event: 'server.started', port: PORT }));

process.on('SIGTERM', () => {
  logger.info({ event: 'server.shutdown.start' });
  io.close(() => server.close(async () => {
    const { redis } = await import('./redis/client');
    await (redis as any).quit?.().catch(() => {});
    logger.info({ event: 'server.shutdown.complete' });
    process.exit(0);
  }));
});
