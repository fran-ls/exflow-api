import { Router } from 'express';
import { createDailyStatValidation, updateDailyStatValidation } from '../middlewares/dailyStat.validation';
import { DailyStatController } from '../controllers/dailyStat.controller';
import { handleValidationErrors } from '../middlewares/validateRequest';

const router = Router();
const dailyStatController = new DailyStatController();

// GET /api/stats/daily
router.get('/', dailyStatController.getAll);

// GET /api/stats/daily/search
router.get('/search', dailyStatController.getWithFilters);

// GET /api/stats/dailyuser/:userId
router.get('/user/:userId', dailyStatController.getByUserId);

// GET /api/stats/daily/:id
router.get('/:id', dailyStatController.getById);

// POST /api/stats/daily
router.post(
  '/',
  createDailyStatValidation,
  handleValidationErrors,
  dailyStatController.create
);

// PATCH /api/stats/daily/:id
router.patch(
  '/:id',
  updateDailyStatValidation,
  handleValidationErrors,
  dailyStatController.update
);

// DELETE /api/stats/daily/:id
router.delete('/:id', dailyStatController.delete);

export default router;