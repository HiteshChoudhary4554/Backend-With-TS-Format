import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-Response.js';

export function roleAuthorized(role: string) {
  return function (req: Request, res: Response, next: NextFunction) {
    //@ts-expect-error user is not a property of Request, but we are adding it in the auth middleware
    if (req.user && req.user.role === role) {
      next();
    } else {
      return ApiResponse.unauthorizedUser(
        res,
        `User is not authorized to access this resource.`,
        `Required role: ${role}`,
      );
    }
  };
}
