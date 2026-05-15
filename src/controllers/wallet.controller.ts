import { Request, Response, NextFunction } from 'express';
import { WalletType } from '../generated/prisma/client';
import { IWalletFilters } from '../interfaces/wallet.interface';
import { WalletService } from '../services/wallet.service';
import { ApiResponse } from '../utils/apiResponse';

export class WalletController {
  private readonly walletService: WalletService;

  constructor() {
    this.walletService = new WalletService();
  }

  // GET /wallets
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const wallets = await this.walletService.getAll();
      ApiResponse.success(res, wallets, 'Wallets retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // GET /wallets/search
  getWithFilters = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: IWalletFilters = {
        name: req.query.name as string,
        type: req.query.type as WalletType,
        userId: req.query.userId as string,
        minBalance: req.query.minBalance ? Number(req.query.minBalance) : undefined,
        maxBalance: req.query.maxBalance ? Number(req.query.maxBalance) : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        orderBy: req.query.orderBy as IWalletFilters['orderBy'],
        order: req.query.order as IWalletFilters['order'],
      }

      const { data, meta } = await this.walletService.getWithFilters(filters);
      ApiResponse.success(res, data, 'Wallets retrieved successfully', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  // GET /wallets/:id
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const wallet = await this.walletService.getById(req.params.id);
      ApiResponse.success(res, wallet, 'Wallet retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // GET /wallets/user/:userId
  getByUserId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const wallets = await this.walletService.getByUserId(req.params.userId);
      ApiResponse.success(res, wallets, 'User wallets retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // POST /wallets
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const wallet = await this.walletService.create(req.body);
      ApiResponse.created(res, wallet, 'Wallet created successfully');
    } catch (error) {
      next(error);
    }
  }

  // PATCH /wallets/:id
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const wallet = await this.walletService.update(req.params.id, req.body);
      ApiResponse.success(res, wallet, 'Wallet updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // DELETE /wallets/:id
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const wallet = await this.walletService.delete(req.params.id);
      ApiResponse.success(res, wallet, 'Wallet deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}