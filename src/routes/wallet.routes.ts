import { Router } from 'express';
import { Role } from '../generated/prisma/enums';
import { WalletController } from '../controllers/wallet.controller';
import {
  createWalletValidation,
  updateWalletValidation,
} from '../middlewares/wallet.validation';
import { handleValidationErrors } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';

const router = Router();
const walletController = new WalletController();

router.use(authenticate);

// GET /api/wallets
router.get('/', authorize(Role.ADMIN), walletController.getAll);

// GET /api/wallets/search
router.get('/search', walletController.getWithFilters);

// POST /api/wallets/new
router.post(
  '/new',
  createWalletValidation,
  handleValidationErrors,
  walletController.create
);

// GET /api/wallets/count
router.get('/count', walletController.countWallets);

// GET /api/wallets/stats
router.get('/stats', walletController.getWalletStats);

// GET /api/wallets/stats/balance
router.get('/stats/balance', walletController.getTotalBalance);

// GET /api/wallets/user/:userId
router.get('/user/:userId', walletController.getByUserId);

// GET /api/wallets/:id
router.get('/:id', walletController.getById);

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