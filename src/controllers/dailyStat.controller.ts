import { Request, Response, NextFunction } from 'express';
import { IDailyStatFilters } from '../interfaces/dailyStat.interface';
import { DailyStatService } from '../services/dailyStat.service';
import { ApiResponse } from '../utils/apiResponse';

export class DailyStatController {
  private readonly dailyStatService: DailyStatService;

  constructor() {
    this.dailyStatService = new DailyStatService();
  }

  // GET /stats/daily
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.dailyStatService.getAll();
      ApiResponse.success(res, stats, 'Daily stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // GET /stats/daily/search
  getWithFilters = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: IDailyStatFilters = {
        day: req.query.day as string,
        date: req.query.date as string,
        userId: req.query.userId as string,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        orderBy: req.query.orderBy as IDailyStatFilters['orderBy'],
        order: req.query.order as IDailyStatFilters['order'],
      }

      const { data, meta } = await this.dailyStatService.getWithFilters(filters);
      ApiResponse.success(res, data, 'Daily stats retrieved successfully', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  // GET /stats/daily/:id
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stat = await this.dailyStatService.getById(req.params.id);
      ApiResponse.success(res, stat, 'Daily stat retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // GET /stats/daily/user/:userId
  getByUserId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.dailyStatService.getByUserId(req.params.userId);
      ApiResponse.success(res, stats, 'User daily stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // POST /stats/daily
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.user?.sub) {
      req.body.userId = req.user.sub;
    }

    try {
      const stat = await this.dailyStatService.create(req.body);
      ApiResponse.created(res, stat, 'Daily stat created successfully');
    } catch (error) {
      next(error);
    }
  }

  // PATCH /stats/daily/:id
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stat = await this.dailyStatService.update(req.params.id, req.body);
      ApiResponse.success(res, stat, 'Daily stat updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // DELETE /stats/daily/:id
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stat = await this.dailyStatService.delete(req.params.id);
      ApiResponse.success(res, stat, 'Daily stat deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}