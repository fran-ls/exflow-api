import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import walletRoutes from './wallet.routes';
import userRoutes from './user.routes';
import transactionRoutes from './transaction.routes';
import dailyStatRoutes from './dailyStat.routes';
import monthlyStatRoutes from './monthlyStat.routes';
import yearlyStatRoutes from './yearlyStat.routes';
import dashboardRoutes from './dashboard.routes';
import { saveTransactionMock } from '../utils/seed/saveTransactionMock';
import { ApiResponse } from '../utils/apiResponse';
import { saveWalletMock } from '../utils/seed/saveWalletMock';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

router.get('/seed/wallets', async (req: Request, res: Response, next) => {
  const userId = req.query.userId as string;

  try {
    const data = await saveWalletMock(userId);
    ApiResponse.success(res, data, 'Wallets saved');
  } catch (error) {
    next(error);
  }
});

router.get('/seed/transactions', async (req: Request, res: Response, next) => {
  const params = {
    userId: req.query.userId as string,
    weekday: req.query.weekday as string,
  } as any;

  try {
    const data = await saveTransactionMock(params);
    ApiResponse.success(res, data, 'Transactions saved');
  } catch (error) {
    next(error);
  }
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/wallets', walletRoutes);
router.use('/transactions', transactionRoutes);
router.use('/stats/daily', dailyStatRoutes);
router.use('/stats/monthly', monthlyStatRoutes);
router.use('/stats/yearly', yearlyStatRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;