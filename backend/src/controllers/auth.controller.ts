import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { supabase } from '../config/supabase';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../crypto/tokens';
import { generateKeypair, encryptPrivateKey } from '../crypto/e2ee';
import { logger } from '../lib/logger';

const registerSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function register(req: Request, res: Response): Promise<void> {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: 'validation_error', details: parse.error.flatten() });
    return;
  }
  const { username, email, password } = parse.data;
  try {
    const { data: ex } = await supabase.from('users').select('id')
      .or(`email.eq.${email},username.eq.${username}`).single();
    if (ex) {
      res.status(409).json({ error: 'conflict', message: 'Username or email already in use' });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate E2EE keypair — fall back gracefully if DB columns not yet migrated
    let e2eeFields: Record<string, string> = {};
    try {
      const kp = generateKeypair();
      const { encrypted, salt } = await encryptPrivateKey(kp.secretKey, password);
      e2eeFields = { public_key: kp.publicKey, encrypted_private_key: encrypted, key_salt: salt };
    } catch (e2eeErr) {
      logger.warn({ event: 'auth.register.e2ee_skipped', err: String(e2eeErr) });
    }

    const insertPayload: Record<string, unknown> = {
      username, email, password_hash: passwordHash, role: 'member', ...e2eeFields,
    };

    let { data: user, error } = await supabase.from('users').insert(insertPayload).select().single();

    // If E2EE columns are missing in DB (PGRST204), retry without them
    if (error?.code === 'PGRST204' && Object.keys(e2eeFields).length > 0) {
      logger.warn({ event: 'auth.register.e2ee_columns_missing', hint: 'Run add_e2ee_columns.sql migration' });
      const fallback = await supabase.from('users').insert({
        username, email, password_hash: passwordHash, role: 'member',
      }).select().single();
      user = fallback.data;
      error = fallback.error;
    }

    if (error || !user) {
      console.error('Supabase registration error:', error);
      res.status(500).json({ error: 'internal_error', message: 'Registration failed' });
      return;
    }

    // Auto-join the user to a default room (e.g. general) so they can chat immediately
    try {
      const { data: defaultRoom } = await supabase.from('rooms').select('id').order('created_at', { ascending: true }).limit(1).single();
      if (defaultRoom) {
        await supabase.from('room_members').insert({
          room_id: defaultRoom.id,
          user_id: user.id,
          local_role: 'member'
        });
      }
    } catch (roomErr) {
      logger.error({ event: 'auth.register.auto_join_failed', err: String(roomErr) });
    }
    const refreshToken = signRefreshToken({ userId: user.id });
    await supabase.from('users').update({ refresh_token: refreshToken }).eq('id', user.id);
    const accessToken = signAccessToken({ userId: user.id, username: user.username, role: user.role });
    res.cookie('refreshToken', refreshToken, COOKIE);
    res.status(201).json({
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
      accessToken,
    });
    logger.info({ event: 'auth.register', userId: user.id });
  } catch (e) {
    console.error('Registration Catch Error:', e);
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: 'internal_error', message: msg });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: 'validation_error', details: parse.error.flatten() });
    return;
  }
  const { email, password } = parse.data;
  try {
    const { data: user } = await supabase.from('users').select('*').eq('email', email).single();
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      res.status(401).json({ error: 'unauthorized', message: 'Invalid credentials' });
      return;
    }
    const accessToken = signAccessToken({ userId: user.id, username: user.username, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id });
    await supabase.from('users').update({
      refresh_token: refreshToken,
      last_seen: new Date().toISOString(),
    }).eq('id', user.id);
    res.cookie('refreshToken', refreshToken, COOKIE);
    res.status(200).json({
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
      accessToken,
      encryptedPrivateKey: user.encrypted_private_key,
      keySalt: user.key_salt,
    });
    logger.info({ event: 'auth.login', userId: user.id, role: user.role });
  } catch (e) {
    res.status(500).json({ error: 'internal_error', message: 'Login failed' });
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(401).json({ error: 'unauthorized', message: 'No refresh token' });
    return;
  }
  try {
    const { userId } = verifyRefreshToken(token);
    const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
    if (!user || user.refresh_token !== token) {
      res.status(401).json({ error: 'unauthorized', message: 'Refresh token invalid or reused' });
      return;
    }
    const newAccessToken = signAccessToken({ userId: user.id, username: user.username, role: user.role });
    const newRefreshToken = signRefreshToken({ userId: user.id });
    await supabase.from('users').update({ refresh_token: newRefreshToken }).eq('id', user.id);
    res.cookie('refreshToken', newRefreshToken, COOKIE);
    res.status(200).json({ accessToken: newAccessToken });
  } catch {
    res.clearCookie('refreshToken');
    res.status(401).json({ error: 'token_expired', message: 'Session expired' });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.refreshToken;
  if (token) {
    try {
      const { userId } = verifyRefreshToken(token);
      await supabase.from('users').update({ refresh_token: null }).eq('id', userId);
    } catch { /* ignore */ }
  }
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out' });
}
