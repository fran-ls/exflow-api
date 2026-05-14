import { Router, Request, Response } from 'express';
import { saveUser } from '../utils/saveUser'
import authRoutes from './auth.routes';
import walletRoutes from './wallet.routes';
import userRoutes from './user.routes';
import transactionRoutes from './transaction.routes';
import dailyStatRoutes from './dailyStat.routes';
import monthlyStatRoutes from './monthlyStat.routes';
import yearlyStatRoutes from './yearlyStat.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

router.get('/u', async (req: Request, res: Response) => {
  res.json(await saveUser());
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