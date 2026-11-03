// access token
// if token doesn't exist then move next
// if exists then verify the token and attach the user to the request object

import { Request, Response, NextFunction } from 'express';
type tokenType = string | undefined;
import { verifyAccessToken } from '../utils/token.js';
import { ApiError } from '../utils/api-Error.js';

// if check req.user exist or not
// if exist then next then throw error

export function restrictToAuthenticatedUser() {
  return function (req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.accessToken as tokenType;
    if (!token) throw ApiError.unauthorized('Authentication required..');

    const user = verifyAccessToken(token);
    if (!user) throw ApiError.unauthorized('Provide valid token..');

    // @ts-expect-error Express Request does not know about user
    req.user = user;
    next();
  };
}
