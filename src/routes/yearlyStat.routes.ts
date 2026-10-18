import { Router } from 'express';
import { createYearlyStatValidation, updateYearlyStatValidation } from '../middlewares/yearlyStat.validation';
import { YearlyStatController } from '../controllers/yearlyStat.controller';
import { handleValidationErrors } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const yearlyStatController = new YearlyStatController();

router.use(authenticate);

// GET /api/stats/yearly
router.get('/', yearlyStatController.getAll);

// GET /api/stats/yearly/search
router.get('/search', yearlyStatController.getWithFilters);

// GET /api/stats/yearly/change
router.patch('/change', yearlyStatController.changeStats);

// GET /api/stats/yearly/user/:userId
router.get('/user/:userId', yearlyStatController.getByUserId);

// GET /api/stats/yearly/:id
router.get('/:id', yearlyStatController.getById);

// POST /api/stats/yearly
router.post(
  '/',
  createYearlyStatValidation,
  handleValidationErrors,
  yearlyStatController.create
);

// PATCH /api/stats/yearly/:id
router.patch(
  '/:id',
  updateYearlyStatValidation,
  handleValidationErrors,
  yearlyStatController.update
);

// DELETE /api/stats/yearly/:id
router.delete('/:id', yearlyStatController.delete);

export default router;