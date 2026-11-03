import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-Response.js';
import type { ZodObject } from 'zod';

export function validate<T extends ZodObject>(dtoModel: T) {
  return function (req: Request, res: Response, next: NextFunction) {
    const validationResult = dtoModel.safeParse(req.body);
    if (!validationResult.success)
      return ApiResponse.zodValidationFailed(
        res,
        'Body validation failed..',
        //@ts-expect-error zod issue
        validationResult.error.issues,
      );

    const validateData = validationResult.data;
    req.body = validateData;
    next();
  };
}
