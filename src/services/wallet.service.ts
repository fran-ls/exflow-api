import { Wallet } from '../generated/prisma/client';
import { ICreateWallet, IUpdateWallet, IUpdateWalletBalance, IWallet, IWalletFilters, IWalletSelect, IWalletStatFilters } from '../interfaces/wallet.interface';
import { WalletRepository } from '../repositories/wallet.repository';
import { NotFoundError, ValidationError } from '../utils/appError';
import { ApiResponse } from '../utils/apiResponse';

export class WalletService {
  private readonly walletRepository: WalletRepository;

  constructor() {
    this.walletRepository = new WalletRepository();
  }

  async query<T = any>(sql: string): Promise<T> {
    return this.walletRepository.execute<T>(sql);
  }

  async findUnique(filters: Partial<IWallet>): Promise<Wallet> {
    const payload: any = {
      where: filters,
      // include: false,
      // omit: { updatedAt: false },
      // select: { name: true }
    }

    const wallet = await this.walletRepository.findUnique(payload);
    if (!wallet) throw new NotFoundError('Wallet');
    return wallet;
  }

  async getAll(): Promise<Wallet[]> {
    return this.walletRepository.findAll();
  }

  async getWithFilters(
    filters: IWalletFilters
  ): Promise<{ data: Wallet[]; total: number; meta: ReturnType<typeof ApiResponse.buildPaginationMeta> }> {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;

    const { data, total } = await this.walletRepository.findWithFilters({
      ...filters,
      page,
      limit,
    });

    const meta = ApiResponse.buildPaginationMeta(total, page, limit);
    return { data, total, meta }
  }

  async getById(id: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findById(id);
    if (!wallet) throw new NotFoundError('Wallet');
    return wallet;
  }

  async getByUserId(userId: string): Promise<Wallet[]> {
    return this.walletRepository.findByUserId(userId);
  }

  async create(data: ICreateWallet): Promise<Wallet> {
    return this.walletRepository.create({
      ...data,
      balance: data.initBalance,
    });
  }

  async update(id: string, data: IUpdateWallet): Promise<Wallet> {
    await this.getById(id);
    return this.walletRepository.update(id, data);
  }

  async delete(id: string): Promise<Wallet> {
    const { userId } = await this.getById(id);

    // await this.query(`
    //   UPDATE daily_stats SET
    //     income = 0,
    //     expense = 0,
    //     balance = 0,
    //     income_count = 0,
    //     expense_count = 0
    //   WHERE user_id = '${userId}'
    // `);

    // await this.query(`
    //   UPDATE monthly_stats SET
    //     income = 0,
    //     expense = 0,
    //     balance = 0,
    //     income_count = 0,
    //     expense_count = 0
    //   WHERE user_id = '${userId}'
    // `);

    // await this.query(`
    //   UPDATE yearly_stats SET
    //     income = 0,
    //     expense = 0,
    //     balance = 0,
    //     income_count = 0,
    //     expense_count = 0
    //   WHERE user_id = '${userId}'
    // `);

    return this.walletRepository.delete(id);
  }

  async updateBalance(id: string, { amount, type }: IUpdateWalletBalance): Promise<Wallet> {
    const wallet = await this.findUnique({ id });
    const isIncome = type === 'INCOME';

    return await this.update(wallet.id, {
      balance: isIncome ? wallet.balance + amount : wallet.balance - amount,
      income: isIncome ? wallet.income + amount : wallet.income,
      expense: !isIncome ? wallet.expense + amount : wallet.expense,
      incomeCount: isIncome ? wallet.incomeCount + 1 : wallet.incomeCount,
      expenseCount: !isIncome ? wallet.expenseCount + 1 : wallet.expenseCount,
    });
  }

  async revertBalance(id: string, { amount, type }: IUpdateWalletBalance): Promise<Wallet> {
    const wallet = await this.findUnique({ id });
    const isIncome = type === 'INCOME';

    return this.update(id, {
      balance: isIncome ? wallet.balance - amount : wallet.balance + amount,
      income: isIncome ? wallet.income - amount : wallet.income,
      expense: !isIncome ? wallet.expense - amount : wallet.expense,
      incomeCount: isIncome ? wallet.incomeCount - 1 : wallet.incomeCount,
      expenseCount: !isIncome ? wallet.expenseCount - 1 : wallet.expenseCount,
    });
  }

  async countWallets(filters: IWalletSelect) {
    if (!filters.userId) {
      throw new ValidationError('userId is required');
    }

    return await this.walletRepository.count(filters);
  }

  async getTotalBalance(userId: string) {
    if (!userId) {
      throw new ValidationError('userId is required');
    }

    return await this.walletRepository.getTotalBalance(userId);
  }

  async getWalletStats(filters: IWalletStatFilters) {
    return await this.walletRepository.getWalletStats(filters);
  }
}