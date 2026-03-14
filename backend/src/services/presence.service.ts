import { redis } from '../redis/client';

const KEY = (id: string) => `presence:${id}`;
const TTL = 30;

export async function setOnline(userId: string, socketId: string) {
  await redis.set(KEY(userId), socketId, { ex: TTL });
}

export async function heartbeat(userId: string) {
  await redis.expire(KEY(userId), TTL);
}

export async function setOffline(userId: string) {
  await redis.del(KEY(userId));
}

export async function isOnline(userId: string): Promise<boolean> {
  return (await redis.exists(KEY(userId))) === 1;
}

export async function getOnlineBatch(userIds: string[]): Promise<Record<string, boolean>> {
  if (!userIds.length) return {};
  const vals = await redis.mget<string[]>(...userIds.map(KEY));
  return Object.fromEntries(userIds.map((id, i) => [id, vals[i] !== null]));
}
