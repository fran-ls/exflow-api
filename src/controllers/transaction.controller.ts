import { Request, Response, NextFunction } from 'express';
import { TransactionType } from '../generated/prisma/client';
import { ITransactionFilters, ITransactionSelect } from '../interfaces/transaction.interface';
import { TransactionService } from '../services/transaction.service';
import { ApiResponse } from '../utils/apiResponse';

export class TransactionController {
  private readonly transactionService: TransactionService;

  constructor() {
    this.transactionService = new TransactionService();
  }

  // GET /transactions
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transactions = await this.transactionService.getAll();
      ApiResponse.success(res, transactions, 'Transactions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /transactions/search
   * Returns transactions with optional filters + pagination
  */
  getWithFilters = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: ITransactionFilters = {
        userId: req.query.userId as string,
        walletId: req.query.walletId as string,
        type: req.query.type as TransactionType,
        title: req.query.title as string,
        description: req.query.description as string,
        date: req.query.date as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
        maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        orderBy: req.query.orderBy as ITransactionFilters['orderBy'],
        order: req.query.order as ITransactionFilters['order'],
      }

      if (filters.dateFrom) {
        filters.dateFrom = new Date(filters.dateFrom).toISOString();
      }
      if (filters.dateTo) {
        filters.dateTo = new Date(filters.dateTo).toISOString();
      }

      const { data, meta } = await this.transactionService.getWithFilters(filters);
      ApiResponse.success(res, data, 'Transactions retrieved successfully', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  // GET /transactions/:id
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transaction = await this.transactionService.getById(req.params.id);
      ApiResponse.success(res, transaction, 'Transaction retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // GET /transactions/wallet/:walletId
  getByWalletId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transactions = await this.transactionService.getByWalletId(req.params.walletId);
      ApiResponse.success(res, transactions, 'Wallet transactions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // GET /transactions/user/:userId
  getByUserId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transactions = await this.transactionService.getByUserId(req.params.userId);
      ApiResponse.success(res, transactions, 'User transactions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // GET /transactions/wallet/:walletId/summary
  getSummaryByWallet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const summary = await this.transactionService.getSummaryByWallet(req.params.walletId);
      ApiResponse.success(res, summary, 'Transaction summary retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // POST /transactions/new
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transaction = await this.transactionService.create(req.body);
      ApiResponse.created(res, transaction, 'Transaction created successfully');
    } catch (error) {
      next(error);
    }
  }

  // PATCH /transactions/:id
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transaction = await this.transactionService.update(req.params.id, req.body);
      ApiResponse.success(res, transaction, 'Transaction updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // DELETE /transactions/:id
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transaction = await this.transactionService.delete(req.params.id);
      ApiResponse.success(res, transaction, 'Transaction deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // GET /transactions/count
  countTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const date = req.query.date as string;

    const filters: ITransactionSelect = {
      userId: req.query.userId as string,
      walletId: req.query.walletId as string,
    }

    if (date) {
      const [year, month, day] = date.split('-');
      filters.year = Number(year);
      filters.month = Number(month);
      filters.day = Number(day);
    }

    try {
      const wallet = await this.transactionService.countTransactions(filters);
      ApiResponse.success(res, wallet, 'Transaction count retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}