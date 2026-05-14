import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/authenticate';
import { authRateLimiter } from '../middlewares/rateLimiter';
import { handleValidationErrors } from '../middlewares/validateRequest';
import {
  registerValidation,
  loginValidation,
  refreshValidation,
  changePasswordValidation,
} from '../middlewares/auth.validation';

const router = Router();
const authController = new AuthController();

/**
 * @route  POST /api/auth/register
 * @access Public
*/
router.post(
  '/register',
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
  refreshValidation,
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
  refreshValidation,
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

export default router;
