import { z } from 'zod';

const registerSchema = z.object({
  fullName: z.string().trim().min(1).max(255),
  email: z.string().trim().email().max(322),
  phone: z.string().regex(/^\+?\d{10,14}$/),
  password: z.string().min(8).max(256),
  startTime: z.string().regex(/^(0[1-9]|1[0-2]):[0-5]\d:[0-5]\d (AM|PM)$/),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(322),
  password: z.string().min(8).max(256),
});

const emailVerifySchema = z.object({
  email: z.string().trim().email().max(322),
  verificationCode: z.string(),
});

const forgetPasswordSchema = z.object({
  email: z.string().trim().email().max(322),
});

const resetPasswordSchema = z.object({
  email: z.string().trim().email().max(322),
  resetPasswordCode: z.string(),
  newPassword: z.string().min(8).max(256),
});

export {
  registerSchema,
  loginSchema,
  emailVerifySchema,
  forgetPasswordSchema,
  resetPasswordSchema,
};
