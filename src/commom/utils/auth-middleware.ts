// access token
// if token doesn't exist then move next
// if exists then verify the token and attach the user to the request object

import { Request, Response, NextFunction } from "express";
type tokenType = string | undefined;
import { verifyAccessToken } from "./token.js";
import { ApiError } from "./api-Error.js";

export function authenticationMiddleware() {
  return function (req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.access_token as tokenType;
    if (!token) {
      return next();
    }
    const user = verifyAccessToken(token);
    if (!user) throw ApiError.badRequest("Provide valid token..");
    //@ts-ignore
    req.user = user;
    next();
  };
}

// if check req.user exist or not
// if exist then next then throw error

export function restrictToAuthenticatedUser() {
  return function (req: Request, res: Response, next: NextFunction) {
    //@ts-ignore
    if (!req.user) throw ApiError.unauthorized("Authentication required..");
    next();
  };
}
