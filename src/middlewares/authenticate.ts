import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '../utils/jwt';
import { UnauthorizedError } from '../utils/appError';

/**
 * authenticate — verifies the Bearer access token.
 * Attaches decoded payload to req.user on success.
*/
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const payload = JwtUtil.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
}