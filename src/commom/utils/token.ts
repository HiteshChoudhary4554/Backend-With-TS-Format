import JWT from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "./env.js";
import { randomBytes, createHmac } from "node:crypto";

export interface UserTokenPayload {
  id: string;
}

const createAccessToken = (payload: UserTokenPayload) => {
  return JWT.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as NonNullable<
      SignOptions["expiresIn"]
    >,
  });
};

const verifyAccessToken = (token: string) => {
  try {
    return JWT.verify(token, env.JWT_ACCESS_SECRET) as UserTokenPayload;
  } catch (error) {
    return null;
  }
};

const createRefreshToken = (payload: UserTokenPayload) => {
  return JWT.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as NonNullable<
      SignOptions["expiresIn"]
    >,
  });
};

const verifyRefreshToken = (token: string) => {
  try {
    return JWT.verify(token, env.JWT_REFRESH_SECRET) as UserTokenPayload;
  } catch (error) {
    return null;
  }
};

const createToken = () => {
  return randomBytes(32).toString("hex");
};

const createHash = (salt: string, payload: string) => {
  return createHmac("sha256", salt).update(payload).digest("hex");
};

export {
  createAccessToken,
  verifyAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  createToken,
  createHash,
};
