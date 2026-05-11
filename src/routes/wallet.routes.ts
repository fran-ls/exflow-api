import { Router } from 'express';
import { WalletController } from '../controllers/wallet.controller';
import {
  createWalletValidation,
  updateWalletValidation,
} from '../middlewares/wallet.validation';
import { handleValidationErrors } from '../middlewares/validateRequest';

const router = Router();
const walletController = new WalletController();

// GET /api/wallets
router.get('/', walletController.getAll);

// GET /api/wallets/search
router.get('/search', walletController.getWithFilters);

// GET /api/wallets/user/:userId
router.get('/user/:userId', walletController.getByUserId);

// GET /api/wallets/:id
router.get('/:id', walletController.getById);

// POST /api/wallets
router.post(
  '/',
  createWalletValidation,
  handleValidationErrors,
  walletController.create
);

// PATCH /api/wallets/:id
router.patch(
  '/:id',
  updateWalletValidation,
  handleValidationErrors,
  walletController.update
);

// DELETE /api/wallets/:id
router.delete('/:id', walletController.delete);

export default router;