import { Request, Response, NextFunction } from 'express';
import { Role } from '../generated/prisma/enums';
import { ForbiddenError } from '../utils/appError';

/**
 * ownerOrAdmin — ensures the authenticated user is either:
 *   • an ADMIN, or
 *   • the resource owner (req.user.sub === req.params.userId)
 *
 * Use on wallet/transaction routes to prevent cross-user access.
*/
export const ownerOrAdmin = (userIdParam = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const requester = req.user!;
    const resourceUserId = (
      req.params[userIdParam] ||
      req.query[userIdParam] ||
      req.body[userIdParam]
    );

    if (
      requester.role === Role.ADMIN ||
      requester.sub === resourceUserId
    ) {
      return next();
    }

    next(new ForbiddenError('Access denied: resource belongs to another user'));
  }
}