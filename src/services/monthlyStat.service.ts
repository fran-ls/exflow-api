import { MonthlyStat, TransactionType } from '../generated/prisma/client';
import { ICreateMonthlyStat, IUpdateMonthlyStat, IMonthlyStatFilters, IUpdateBalance, IMonthlyStat } from '../interfaces/monthlyStat.interface';
import { MonthlyStatRepository } from '../repositories/monthlyStat.repository';
import { NotFoundError, ValidationError } from '../utils/appError';
import { ApiResponse } from '../utils/apiResponse';
import { MonthlyStatFilters } from '../interfaces/analytic.interface';
import { AnalyticService } from './analytic.service';

const analyticService = new AnalyticService();

export class MonthlyStatService {
  private readonly monthlyStatRepository: MonthlyStatRepository;

  constructor() {
    this.monthlyStatRepository = new MonthlyStatRepository();
  }

  async findOne(filters: Partial<IMonthlyStat>): Promise<MonthlyStat> {
    const stat = await this.monthlyStatRepository.findOne(filters);
    if (!stat) throw new NotFoundError('MonthlyStat');
    return stat;
  }

  async getAll(): Promise<MonthlyStat[]> {
    return this.monthlyStatRepository.findAll();
  }

  async getWithFilters(
    filters: IMonthlyStatFilters
  ): Promise<{ data: MonthlyStat[]; total: number; meta: ReturnType<typeof ApiResponse.buildPaginationMeta> }> {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;

    const { data, total } = await this.monthlyStatRepository.findWithFilters({
      ...filters,
      page,
      limit,
    });

    const meta = ApiResponse.buildPaginationMeta(total, page, limit);
    return { data, total, meta }
  }

  async getById(id: string): Promise<MonthlyStat> {
    const stat = await this.monthlyStatRepository.findById(id);
    if (!stat) throw new NotFoundError('MonthlyStat');
    return stat;
  }

  async getByUserId(userId: string): Promise<MonthlyStat[]> {
    return this.monthlyStatRepository.findByUserId(userId);
  }

  async create(data: ICreateMonthlyStat): Promise<MonthlyStat> {
    return this.monthlyStatRepository.create(data);
  }

  async update(id: string, data: IUpdateMonthlyStat): Promise<MonthlyStat> {
    await this.getById(id);
    return this.monthlyStatRepository.update(id, data);
  }

  async delete(id: string): Promise<MonthlyStat> {
    await this.getById(id);
    return this.monthlyStatRepository.delete(id);
  }

  async updateBalance(data: IUpdateBalance): Promise<MonthlyStat> {
    const stat = await this.monthlyStatRepository.findOne({
      userId: data.userId, month: data.month
    });
    const isIncome = data.type === 'INCOME';

    if (stat) {
      return this.monthlyStatRepository.update(stat.id, {
        balance: isIncome ? stat.balance + data.amount : stat.balance - data.amount,
        income: isIncome ? stat.income + data.amount : stat.income,
        expense: !isIncome ? stat.expense + data.amount : stat.expense,
        incomeCount: isIncome ? stat.incomeCount + 1 : stat.incomeCount,
        expenseCount: !isIncome ? stat.expenseCount + 1 : stat.expenseCount,
      });
    }

    return await this.monthlyStatRepository.create({
      month: data.month,
      income: isIncome ? data.amount : 0,
      expense: !isIncome ? data.amount : 0,
      balance: isIncome ? data.amount : -data.amount,
      incomeCount: isIncome ? 1 : 0,
      expenseCount: !isIncome ? 1 : 0,
      userId: data.userId,
    });
  }

  async revertBalance(userId: string, month: string, amount: number, type: TransactionType) {
    const stat = await this.monthlyStatRepository.findOne({ userId, month });
    if (!stat) return stat;

    const isIncome = type === 'INCOME';

    return await this.update(stat.id, {
      balance: isIncome ? stat.balance - amount : stat.balance + amount,
      income: isIncome ? stat.income - amount : stat.income,
      expense: !isIncome ? stat.expense - amount : stat.expense,
      incomeCount: isIncome ? stat.incomeCount - 1 : stat.incomeCount,
      expenseCount: !isIncome ? stat.expenseCount - 1 : stat.expenseCount,
    });
  }

  async changeStats(filters: MonthlyStatFilters, action: 'create' | 'update' | 'get' = 'get') {
    const { userId, month } = filters;
    if (!userId) throw new ValidationError('User not found');

    const { data: monthlyStats } = await this.getWithFilters({ userId });

    const { months } = await analyticService.getTransactionSummary({ userId });

    for (const d in months) {
      const t = months[d];

      if (action === 'create' || !monthlyStats.length) await this.create({
        month: t.month,
        income: t.income,
        expense: t.expense,
        incomeCount: t.incomeCount,
        expenseCount: t.expenseCount,
        balance: 0,
        userId
      });

      if (action === 'update') {
        const stat = await this.findOne({ userId, month: t.month });
        stat && this.update(stat.id, {
          income: t.income,
          expense: t.expense,
          incomeCount: t.incomeCount,
          expenseCount: t.expenseCount
        });
      }
    }

    return months;
  }
}