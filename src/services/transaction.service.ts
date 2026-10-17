import { Transaction } from '../generated/prisma/client';
import { ICreateTransaction, IUpdateTransaction, ITransactionFilters, ITransactionSelect } from '../interfaces/transaction.interface';
import { TransactionRepository } from '../repositories/transaction.repository';
import { WalletService } from './wallet.service';
import { DailyStatService } from './dailyStat.service';
import { MonthlyStatService } from './monthlyStat.service';
import { YearlyStatService } from './yearlyStat.service';
import { NotFoundError, ValidationError } from '../utils/appError';
import { ApiResponse } from '../utils/apiResponse';
import { getFmtDate } from '../utils/fmtDate';

export class TransactionService {
  private readonly transactionRepository: TransactionRepository;
  private readonly walletService: WalletService;
  private readonly dailyStatService: DailyStatService;
  private readonly monthlyStatService: MonthlyStatService;
  private readonly yearlyStatService: YearlyStatService;

  constructor() {
    this.transactionRepository = new TransactionRepository();
    this.dailyStatService = new DailyStatService();
    this.monthlyStatService = new MonthlyStatService();
    this.yearlyStatService = new YearlyStatService();
    this.walletService = new WalletService();
  }

  async getAll(): Promise<Transaction[]> {
    return this.transactionRepository.findAll();
  }

  async getWithFilters(filters: ITransactionFilters, paginated = true): Promise<{
    data: Transaction[];
    total: number;
    meta: ReturnType<typeof ApiResponse.buildPaginationMeta>;
  }> {
    if (!filters.userId) {
      throw new ValidationError('userId is required');
    }

    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;

    const { data, total } = await this.transactionRepository.findWithFilters({
      ...filters,
      page,
      limit,
    }, paginated);

    const meta = ApiResponse.buildPaginationMeta(total, page, limit);
    return { data, total, meta }
  }

  async getById(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id);
    if (!transaction) throw new NotFoundError('Transaction');
    return transaction;
  }

  async getByWalletId(walletId: string): Promise<Transaction[]> {
    const wallet = await this.walletService.getById(walletId);
    if (!wallet) throw new NotFoundError('Wallet');
    return this.transactionRepository.findByWalletId(walletId);
  }

  async getByUserId(userId: string): Promise<Transaction[]> {
    return this.transactionRepository.findByUserId(userId);
  }

  async getSummaryByWallet(walletId: string) {
    const wallet = await this.walletService.getById(walletId);
    if (!wallet) throw new NotFoundError('Wallet');
    return this.transactionRepository.getSummaryByWallet(walletId);
  }

  async create(data: ICreateTransaction): Promise<Transaction> {
    const wallet = await this.walletService.getById(data.walletId);
    if (!wallet) throw new NotFoundError('Wallet');

    if (data.type === 'EXPENSE' && data.amount > wallet.balance) {
      throw new ValidationError("You don't have enough balance");
    }

    const [year, month, day] = (data.date).split('-').map(Number);
    const date = new Date(`${data.date}T${data.time}`)

    const transaction = await this.transactionRepository.create({
      ...data, date, year, month, day
    });

    await this.dailyStatService.updateBalance({
      day: data.date,
      date,
      amount: data.amount,
      type: data.type,
      userId: data.userId
    });

    await this.monthlyStatService.updateBalance({
      month: data.date.slice(0, 7),
      amount: data.amount,
      type: data.type,
      userId: data.userId
    });

    await this.yearlyStatService.updateBalance({
      year,
      amount: data.amount,
      type: data.type,
      userId: data.userId
    });

    await this.walletService.updateBalance(data.walletId, {
      amount: data.amount,
      type: data.type
    });

    return transaction;
  }

  async update(id: string, data: IUpdateTransaction): Promise<Transaction> {
    const existing = await this.getById(id);

    // Revert old balance effect if amount or type changes
    const amountChanged = data.amount !== undefined && data.amount !== existing.amount;
    const typeChanged = data.type !== undefined && data.type !== existing.type;

    if (amountChanged || typeChanged) {
      await this.walletService.revertBalance(existing.walletId, {
        amount: existing.amount,
        type: existing.type
      });

      const newType = data.type ?? existing.type;
      const newAmount = data.amount ?? existing.amount;

      await this.walletService.updateBalance(existing.walletId, {
        amount: newAmount,
        type: newType
      });
    }

    return this.transactionRepository.update(id, data);
  }

  async delete(id: string): Promise<Transaction | null> {
    const existing = await this.getById(id);
    const transaction = await this.transactionRepository.delete(id);
    const date = getFmtDate(transaction.date, '').split(' ')[0];

    await this.dailyStatService.revertBalance(
      existing.userId,
      date,
      transaction.amount,
      transaction.type
    );

    await this.monthlyStatService.revertBalance(
      existing.userId,
      date.slice(0, 7),
      transaction.amount,
      transaction.type
    );

    await this.yearlyStatService.revertBalance(
      existing.userId,
      parseInt(date.slice(0, 4)),
      transaction.amount,
      transaction.type
    );

    await this.walletService.revertBalance(existing.walletId, {
      amount: existing.amount,
      type: existing.type
    });

    return transaction;
  }

  async countTransactions(filters: ITransactionSelect) {
    if (!filters.userId) {
      throw new ValidationError('userId is required');
    }

    return await this.transactionRepository.count(filters);
  }
}