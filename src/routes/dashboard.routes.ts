import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const dashboardController = new DashboardController();

router.use(authenticate);

// GET /api/dashboard/transactions
router.get('/transactions', dashboardController.getWeeklyTransactions);

// GET /api/dashboard/summary/monthly
router.get('/summary/monthly', dashboardController.getMonthlySummary);

// GET /api/dashboard/summary/weekly
router.get('/summary/weekly', dashboardController.getWeeklySummary);

// GET /api/dashboard/wallets
router.get('/wallets', dashboardController.getFrequentWallets);

// GET /api/dashboard/totals
router.get('/totals', dashboardController.getTotals);

export default router;