import JWT from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { env } from './env.js';
import { randomBytes, createHmac, randomInt } from 'node:crypto';

export interface UserTokenPayload {
  id: string;
}

const createAccessToken = (payload: UserTokenPayload): string => {
  return JWT.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as NonNullable<SignOptions['expiresIn']>,
  });
};

const verifyAccessToken = (token: string): UserTokenPayload | null => {
  try {
    return JWT.verify(token, env.JWT_ACCESS_SECRET) as UserTokenPayload;
  } catch {
    return null;
  }
};

const createRefreshToken = (payload: UserTokenPayload): string => {
  return JWT.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as NonNullable<SignOptions['expiresIn']>,
  });
};

const verifyRefreshToken = (token: string): UserTokenPayload | null => {
  try {
    return JWT.verify(token, env.JWT_REFRESH_SECRET) as UserTokenPayload;
  } catch {
    return null;
  }
};

const createToken = (): string => {
  return randomBytes(32).toString('hex');
};

const createHash = (salt: string, payload: string): string => {
  return createHmac('sha256', salt).update(payload).digest('hex');
};

const createSixCode = (): string => {
  return randomInt(100000, 1000000).toString();
};

export {
  createAccessToken,
  verifyAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  createToken,
  createHash,
  createSixCode,
};
