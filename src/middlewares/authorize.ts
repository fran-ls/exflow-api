import { Request, Response, NextFunction } from 'express';
import { Role } from '../generated/prisma/enums';
import { ForbiddenError, UnauthorizedError } from '../utils/appError';

/**
 * authorize(...roles) — checks that req.user has one of the allowed roles.
 * Must be used AFTER authenticate.
*/
export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Not authenticated'));
    }
    if (!roles.includes(req.user.role as Role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    next();
  }
}
