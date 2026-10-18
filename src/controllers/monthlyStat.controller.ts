import { Request, Response, NextFunction } from 'express';
import { IMonthlyStatFilters } from '../interfaces/monthlyStat.interface';
import { MonthlyStatService } from '../services/monthlyStat.service';
import { ApiResponse } from '../utils/apiResponse';

export class MonthlyStatController {
  private readonly monthlyStatService: MonthlyStatService;

  constructor() {
    this.monthlyStatService = new MonthlyStatService();
  }

  // GET /stats/monthly
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.monthlyStatService.getAll();
      ApiResponse.success(res, stats, 'Monthly stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // GET /stats/monthly/search
  getWithFilters = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: IMonthlyStatFilters = {
        month: req.query.month as string,
        userId: req.query.userId as string,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        orderBy: req.query.orderBy as IMonthlyStatFilters['orderBy'],
        order: req.query.order as IMonthlyStatFilters['order'],
      }

      const { data, meta } = await this.monthlyStatService.getWithFilters(filters);
      ApiResponse.success(res, data, 'Monthly stats retrieved successfully', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  // GET /stats/monthly/:id
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stat = await this.monthlyStatService.getById(req.params.id);
      ApiResponse.success(res, stat, 'Monthly stat retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // GET /stats/monthly/user/:userId
  getByUserId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.monthlyStatService.getByUserId(req.params.userId);
      ApiResponse.success(res, stats, 'User monthly stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // POST /stats/monthly
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stat = await this.monthlyStatService.create(req.body);
      ApiResponse.created(res, stat, 'Monthly stat created successfully');
    } catch (error) {
      next(error);
    }
  }

  // PATCH /stats/monthly/:id
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stat = await this.monthlyStatService.update(req.params.id, req.body);
      ApiResponse.success(res, stat, 'Monthly stat updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // PATCH /stats/monthly/change
  changeStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stat = await this.monthlyStatService.changeStats({
        userId: req.query.userId as string,
        income: req.query.income as string,
        expense: req.query.expense as string,
        month: req.query.month as string
      });
      ApiResponse.success(res, stat, 'Monthly stats updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // DELETE /stats/monthly/:id
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stat = await this.monthlyStatService.delete(req.params.id);
      ApiResponse.success(res, stat, 'Monthly stat deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}