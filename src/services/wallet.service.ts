import { Wallet } from '../generated/prisma/client';
import { ICreateWallet, IUpdateWallet, IWalletFilters } from '../interfaces/wallet.interface';
import { WalletRepository } from '../repositories/wallet.repository';
import { NotFoundError } from '../utils/appError';
import { ApiResponse } from '../utils/apiResponse';

export class WalletService {
  private readonly walletRepository: WalletRepository;

  constructor() {
    this.walletRepository = new WalletRepository();
  }

  async query(sql: string): Promise<Wallet[]> {
    return this.walletRepository.execute(sql);
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
}