import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { ApiResponse } from "../utils/apiResponse";

export class DashboardController {
  private readonly dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  // GET /transactions
  getWeeklyTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.sub;

    if (!userId) {
      ApiResponse.badRequest(res, 'userId is required');
      return;
    }

    try {
      const summary = await this.dashboardService.getWeeklyTransactions(userId);
      ApiResponse.success(res, summary, 'Weekly transactions retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  // GET /summary/monthly
  getMonthlySummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.sub;

    if (!userId) {
      ApiResponse.badRequest(res, 'userId is required');
      return;
    }

    try {
      const summary = await this.dashboardService.getMonthlySummary(userId);
      ApiResponse.success(res, summary, 'Monthly summary retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  // GET /summary/weekly
  getWeeklySummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.sub;

    if (!userId) {
      ApiResponse.badRequest(res, 'userId is required');
      return;
    }

    try {
      const summary = await this.dashboardService.getWeeklySummary(userId);
      ApiResponse.success(res, summary, 'Weekly summary retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  // GET /wallets
  getFrequentWallets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.sub;

    if (!userId) {
      ApiResponse.badRequest(res, 'userId is required');
      return;
    }

    try {
      const summary = await this.dashboardService.getFrequentWallets(userId);
      ApiResponse.success(res, summary, 'Frequent wallets retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  // GET /totals
  getTotals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.sub;

    if (!userId) {
      ApiResponse.badRequest(res, 'userId is required');
      return;
    }

    try {
      const summary = await this.dashboardService.getTotals(userId);
      ApiResponse.success(res, summary, 'Totals retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}