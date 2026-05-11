import { Request, Response, NextFunction } from 'express';
import { Prisma } from '../generated/prisma/client';
import { AppError } from '../utils/appError';
import { envs } from '../config/envs';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  console.error(`[Error] ${err.message}`, {
    path: req.path,
    method: req.method,
    stack: envs.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Known operational error
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ success: false, message: 'Resource already exists' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Resource not found' });
      return;
    }
    if (err.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Invalid foreign key reference' });
      return;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({ success: false, message: 'Invalid data provided' });
    return;
  }

  // Unhandled error - 500
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(envs.NODE_ENV === 'development' && { error: err.message }),
  });
}

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
}