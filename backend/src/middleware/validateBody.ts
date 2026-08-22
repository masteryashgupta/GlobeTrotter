import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateBody = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parseResult = schema.safeParse(req.body);

    if (!parseResult.success) {
      const formattedErrors = parseResult.error.flatten();
      return res.status(400).json({
        error: 'Validation failed',
        details: formattedErrors.fieldErrors,
        formErrors: formattedErrors.formErrors,
      });
    }

    req.body = parseResult.data;
    next();
  };
};
