import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';

const router = Router();
const dashboardController = new DashboardController();

// GET /api/dashboard/transactions
router.get('/transactions', dashboardController.getWeeklyTransactions);

// GET /api/dashboard/summary/weekly
router.get('/summary/weekly', dashboardController.getWeeklySummary);

// GET /api/dashboard/wallets
router.get('/wallets', dashboardController.getWallets);

export default router;