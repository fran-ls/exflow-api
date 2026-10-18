import { Request, Response, NextFunction } from 'express';
import { IYearlyStatFilters } from '../interfaces/yearlyStat.interface';
import { YearlyStatService } from '../services/yearlyStat.service';
import { ApiResponse } from '../utils/apiResponse';

export class YearlyStatController {
  private readonly yearlyStatService: YearlyStatService;

  constructor() {
    this.yearlyStatService = new YearlyStatService();
  }

  // GET /stats/yearly
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.yearlyStatService.getAll();
      ApiResponse.success(res, stats, 'Yearly stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // GET /stats/yearly/search
  getWithFilters = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: IYearlyStatFilters = {
        year: parseInt(req.query.day as string),
        userId: req.query.userId as string,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        orderBy: req.query.orderBy as IYearlyStatFilters['orderBy'],
        order: req.query.order as IYearlyStatFilters['order'],
      }

      const { data, meta } = await this.yearlyStatService.getWithFilters(filters);
      ApiResponse.success(res, data, 'Yearly stats retrieved successfully', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  // GET /stats/yearly/:id
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stat = await this.yearlyStatService.getById(req.params.id);
      ApiResponse.success(res, stat, 'Yearly stat retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // GET /stats/yearly/user/:userId
  getByUserId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.yearlyStatService.getByUserId(req.params.userId);
      ApiResponse.success(res, stats, 'User yearly stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // POST /stats/yearly
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stat = await this.yearlyStatService.create(req.body);
      ApiResponse.created(res, stat, 'Yearly stat created successfully');
    } catch (error) {
      next(error);
    }
  }

  // PATCH /stats/yearly/:id
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stat = await this.yearlyStatService.update(req.params.id, req.body);
      ApiResponse.success(res, stat, 'Yearly stat updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // PATCH /stats/yearly/change
  changeStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stat = await this.yearlyStatService.changeStats({
        userId: req.query.userId as string,
        income: req.query.income as string,
        expense: req.query.expense as string,
        year: req.query.year as string
      });
      ApiResponse.success(res, stat, 'Yearly stats updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // DELETE /stats/yearly/:id
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stat = await this.yearlyStatService.delete(req.params.id);
      ApiResponse.success(res, stat, 'Yearly stat deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}