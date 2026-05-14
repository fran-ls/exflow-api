import { Router } from 'express';
import { Role } from '../generated/prisma/enums';
import { TransactionController } from '../controllers/transaction.controller';
import { createTransactionValidation, updateTransactionValidation } from '../middlewares/transaction.validation';
import { handleValidationErrors } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';

const router = Router();
const transactionController = new TransactionController();

router.use(authenticate);

// GET /api/transactions
router.get('/', authorize(Role.ADMIN), transactionController.getAll);

// GET /api/transactions/search
router.get('/search', transactionController.getWithFilters);

// GET /api/transactions/wallet/:walletId
router.get('/wallet/:walletId', transactionController.getByWalletId);

// GET /api/transactions/wallet/:walletId/summary
router.get('/wallet/:walletId/summary', transactionController.getSummaryByWallet);

// GET /api/transactions/user/:userId
router.get('/user/:userId', transactionController.getByUserId);

// GET /api/transactions/:id
router.get('/:id', transactionController.getById);

// POST /api/transactions
router.post(
  '/',
  createTransactionValidation,
  handleValidationErrors,
  transactionController.create
);

// PATCH /api/transactions/:id
router.patch(
  '/:id',
  updateTransactionValidation,
  handleValidationErrors,
  transactionController.update
);

// DELETE /api/transactions/:id
router.delete('/:id', transactionController.delete);

export default router;