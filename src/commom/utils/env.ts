import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  PORT: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().min(12),

  JWT_ACCESS_EXPIRES_IN: z
    .string()
    .regex(/^\d+(s|m|h|d)$/)
    .default('15m'),

  JWT_REFRESH_SECRET: z.string().min(12),

  JWT_REFRESH_EXPIRES_IN: z
    .string()
    .regex(/^\d+(s|m|h|d)$/)
    .default('24h'),

  CLOUDINARY_KEY: z.string().min(1),
  API_KEY: z.string().min(1),
  API_SECRET: z.string().min(1),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) {
    throw new Error(safeParseResult.error.message);
  }
  return safeParseResult.data;
}

export const env = createEnv(process.env);
