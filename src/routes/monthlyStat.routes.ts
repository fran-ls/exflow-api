import { Router } from 'express';
import { createMonthlyStatValidation, updateMonthlyStatValidation } from '../middlewares/monthlyStat.validation';
import { MonthlyStatController } from '../controllers/monthlyStat.controller';
import { handleValidationErrors } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const monthlyStatController = new MonthlyStatController();

router.use(authenticate);

// GET /api/stats/monthly
router.get('/', monthlyStatController.getAll);

// GET /api/stats/monthly/search
router.get('/search', monthlyStatController.getWithFilters);

// GET /api/stats/monthly/change
router.patch('/change', monthlyStatController.changeStats);

// GET /api/stats/monthly/user/:userId
router.get('/user/:userId', monthlyStatController.getByUserId);

// GET /api/stats/monthly/:id
router.get('/:id', monthlyStatController.getById);

// POST /api/stats/monthly
router.post(
  '/',
  createMonthlyStatValidation,
  handleValidationErrors,
  monthlyStatController.create
);

// PATCH /api/stats/monthly/:id
router.patch(
  '/:id',
  updateMonthlyStatValidation,
  handleValidationErrors,
  monthlyStatController.update
);

// DELETE /api/stats/monthly/:id
router.delete('/:id', monthlyStatController.delete);

export default router;