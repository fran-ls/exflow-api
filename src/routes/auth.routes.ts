import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/authenticate';
import { authRateLimiter } from '../middlewares/rateLimiter';
import { handleValidationErrors } from '../middlewares/validateRequest';
import {
  registerValidation,
  loginValidation,
  changePasswordValidation,
} from '../middlewares/auth.validation';
import { body } from 'express-validator';
import { authorize } from '../middlewares/authorize';
import { Role } from '../generated/prisma/enums';

const router = Router();
const authController = new AuthController();

/**
 * @route  POST /api/auth/register
 * @access Private
*/
router.post(
  '/register',
  authenticate,
  authorize(Role.ADMIN),
  authRateLimiter,
  registerValidation,
  handleValidationErrors,
  authController.register
);

/**
 * @route  POST /api/auth/login
 * @access Public
*/
router.post(
  '/login',
  authRateLimiter,
  loginValidation,
  handleValidationErrors,
  authController.login
);

/**
 * @route  POST /api/auth/refresh
 * @desc   Exchange a valid refresh token for new access + refresh tokens
 * @access Public (token-based)
*/
router.post(
  '/refresh',
  // refreshValidation,
  handleValidationErrors,
  authController.refresh
);

/**
 * @route  POST /api/auth/logout
 * @desc   Revoke current refresh token
 * @access Public (token-based)
*/
router.post(
  '/logout',
  // refreshValidation,
  handleValidationErrors,
  authController.logout
);

/**
 * @route  POST /api/auth/logout-all
 * @desc   Revoke ALL refresh tokens for the current user
 * @access Private
*/
router.post('/logout-all', authenticate, authController.logoutAll);

/**
 * @route  GET /api/auth/me
 * @access Private
*/
router.get('/me', authenticate, authController.getProfile);

/**
 * @route  PATCH /api/auth/change-password
 * @access Private
*/
router.patch(
  '/change-password',
  authenticate,
  changePasswordValidation,
  handleValidationErrors,
  authController.changePassword
);

/**
 * @route  POST /api/auth/encrypt-password
 * @access Private
*/
router.post(
  '/encrypt-password',
  authenticate,
  authorize(Role.ADMIN),
  [
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Must contain at least one uppercase letter')
      .matches(/[0-9]/).withMessage('Must contain at least one number')
  ],
  handleValidationErrors,
  authController.encryptPassword
);

export default router;
