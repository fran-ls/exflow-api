import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import walletRoutes from './wallet.routes';
import userRoutes from './user.routes';
import transactionRoutes from './transaction.routes';
import dailyStatRoutes from './dailyStat.routes';
import monthlyStatRoutes from './monthlyStat.routes';
import yearlyStatRoutes from './yearlyStat.routes';
import dashboardRoutes from './dashboard.routes';
import { ApiResponse } from '../utils/apiResponse';
import { SeedMock } from '../utils/seed/seed.mock';
import { SeedDB } from '../utils/seed/seed.db';

const router = Router();
const seed = new SeedDB();
const seedMock = new SeedMock();

router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

router.get('/seed', async (req: Request, res: Response, next) => {
  try {
    const userId = req.query.userId as string;
    const action = req.query.action as any;
    const data = await seedMock.execute({ userId, action });
    ApiResponse.success(res, data);
  } catch (error) {
    next(error);
  }
});

router.get('/seed/db', async (req: Request, res: Response, next) => {
  try {
    const userId = req.query.userId as string;
    const action = req.query.action as string;
    const data = await seed.execute(userId, action as any);
    ApiResponse.success(res, data);
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