import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().optional().default("8080"),
  JWT_ACCESS_SECRET: z.string().min(22),

  JWT_ACCESS_EXPIRES_IN: z
    .string()
    .regex(/^\d+(s|m|h|d)$/)
    .default("15m"),

  JWT_REFRESH_SECRET: z.string().min(22),

  JWT_REFRESH_EXPIRES_IN: z
    .string()
    .regex(/^\d+(s|m|h|d)$/)
    .default("24h"),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) {
    throw new Error(safeParseResult.error.message);
  }
  return safeParseResult.data;
}

export const env = createEnv(process.env);
