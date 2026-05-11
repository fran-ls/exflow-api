import { YearlyStat, TransactionType } from '../generated/prisma/client';
import { ICreateYearlyStat, IUpdateYearlyStat, IYearlyStatFilters, IUpdateBalance, IYearlyStat } from '../interfaces/yearlyStat.interface';
import { YearlyStatRepository } from '../repositories/yearlyStat.repository';
import { NotFoundError } from '../utils/appError';
import { ApiResponse } from '../utils/apiResponse';

export class YearlyStatService {
  private readonly yearlyStatRepository: YearlyStatRepository;

  constructor() {
    this.yearlyStatRepository = new YearlyStatRepository();
  }

  async findOne(filters: Partial<IYearlyStat>): Promise<YearlyStat> {
    const stat = await this.yearlyStatRepository.findOne(filters);
    if (!stat) throw new NotFoundError('YearlyStat');
    return stat;
  }

  async getAll(): Promise<YearlyStat[]> {
    return this.yearlyStatRepository.findAll();
  }

  async getWithFilters(
    filters: IYearlyStatFilters
  ): Promise<{ data: YearlyStat[]; total: number; meta: ReturnType<typeof ApiResponse.buildPaginationMeta> }> {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;

    const { data, total } = await this.yearlyStatRepository.findWithFilters({
      ...filters,
      page,
      limit,
    });

    const meta = ApiResponse.buildPaginationMeta(total, page, limit);
    return { data, total, meta }
  }

  async getById(id: string): Promise<YearlyStat> {
    const stat = await this.yearlyStatRepository.findById(id);
    if (!stat) throw new NotFoundError('YearlyStat');
    return stat;
  }

  async getByUserId(userId: string): Promise<YearlyStat[]> {
    return this.yearlyStatRepository.findByUserId(userId);
  }

  async create(data: ICreateYearlyStat): Promise<YearlyStat> {
    return this.yearlyStatRepository.create(data);
  }

  async update(id: string, data: IUpdateYearlyStat): Promise<YearlyStat> {
    await this.getById(id);
    return this.yearlyStatRepository.update(id, data);
  }

  async delete(id: string): Promise<YearlyStat> {
    await this.getById(id);
    return this.yearlyStatRepository.delete(id);
  }

  async updateBalance(data: IUpdateBalance): Promise<YearlyStat> {
    const stat = await this.yearlyStatRepository.findOne({ year: data.year });
    const isIncome = data.type === 'INCOME';

    if (stat) {
      return this.yearlyStatRepository.update(stat.id, {
        balance: isIncome ? stat.balance + data.amount : stat.balance - data.amount,
        income: isIncome ? stat.income + data.amount : stat.income,
        expense: !isIncome ? stat.expense + data.amount : stat.expense,
        transactionCount: stat.transactionCount + 1
      });
    }

    return await this.yearlyStatRepository.create({
      year: data.year,
      income: isIncome ? data.amount : 0,
      expense: !isIncome ? data.amount : 0,
      balance: data.amount,
      transactionCount: 1,
      userId: data.userId,
    });
  }

  async revertBalance(year: number, amount: number, type: TransactionType) {
    const stat = await this.findOne({ year });
    const isIncome = type === 'INCOME';

    return await this.update(stat.id, {
      balance: isIncome ? stat.balance - amount : stat.balance + amount,
      income: isIncome ? stat.income - amount : stat.income,
      expense: !isIncome ? stat.expense - amount : stat.expense,
      transactionCount: stat.transactionCount - 1
    });
  }
}