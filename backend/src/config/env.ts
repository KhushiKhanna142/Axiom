import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('4000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  POLYGON_RPC_URL: z.string().url(),
  POLYGON_CHAIN_ID: z.string(),
  POLYGON_PRIVATE_KEY: z.string().min(64),
  POLYGON_CONTRACT_ADDRESS: z.string().startsWith('0x'),
  SUPERADMIN_EMAIL: z.string().email(),
  SUPERADMIN_PASSWORD: z.string().min(12),
  SUPERADMIN_USERNAME: z.string().min(3),
});

const result = envSchema.safeParse(process.env);
if (!result.success) {
  console.error('Environment validation failed:');
  console.error(result.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = result.data;
