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
    try {
      const summary = await this.dashboardService.getWeeklyTransactions();
      ApiResponse.success(res, summary, 'Weekly transactions retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  // GET /summary/weekly
  getWeeklySummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const summary = await this.dashboardService.getWeeklySummary();
      ApiResponse.success(res, summary, 'Weekly summary retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  // GET /wallets
  getWallets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const summary = await this.dashboardService.getWallets();
      ApiResponse.success(res, summary, 'Wallets retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}