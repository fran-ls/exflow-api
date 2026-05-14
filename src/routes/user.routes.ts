import { Router } from 'express';
import { body } from 'express-validator';
import { Role } from '../generated/prisma/enums';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { handleValidationErrors } from '../middlewares/validateRequest';

const router = Router();
const userController = new UserController();

// All user routes require authentication
router.use(authenticate);

/**
 * @route  GET /api/users
 * @access ADMIN
*/
router.get('/', authorize(Role.ADMIN), userController.getAll);

/**
 * @route  GET /api/users/:id
 * @access ADMIN or self (enforced in service)
*/
router.get('/:id', userController.getById);

/**
 * @route  PATCH /api/users/:id
 * @access ADMIN or self (enforced in service)
*/
router.patch(
  '/:id',
  [
    body('name').optional().notEmpty().trim(),
    body('email').optional().isEmail().normalizeEmail(),
  ],
  handleValidationErrors,
  userController.update
);

/**
 * @route  PATCH /api/users/:id/status
 * @access ADMIN
*/
router.patch(
  '/:id/status',
  authorize(Role.ADMIN),
  [body('isActive').isBoolean().withMessage('isActive must be a boolean')],
  handleValidationErrors,
  userController.setActive
);

/**
 * @route  PATCH /api/users/:id/role
 * @access ADMIN
*/
router.patch(
  '/:id/role',
  authorize(Role.ADMIN),
  [body('role').isIn(Object.values(Role)).withMessage('Invalid role')],
  handleValidationErrors,
  userController.setRole
);

/**
 * @route  DELETE /api/users/:id
 * @access ADMIN or self (enforced in service)
*/
router.delete('/:id', userController.delete);

export default router;
