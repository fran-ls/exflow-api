import { DailyStat, TransactionType } from '../generated/prisma/client';
import { ICreateDailyStat, IUpdateDailyStat, IDailyStatFilters, IUpdateBalance, IDailyStat } from '../interfaces/dailyStat.interface';
import { DailyStatRepository } from '../repositories/dailyStat.repository';
import { NotFoundError } from '../utils/appError';
import { ApiResponse } from '../utils/apiResponse';

export class DailyStatService {
  private readonly dailyStatRepository: DailyStatRepository;

  constructor() {
    this.dailyStatRepository = new DailyStatRepository();
  }

  async findOne(filters: Partial<IDailyStat>): Promise<DailyStat> {
    const stat = await this.dailyStatRepository.findOne(filters);
    if (!stat) throw new NotFoundError('DailyStat');
    return stat;
  }

  async getAll(): Promise<DailyStat[]> {
    return this.dailyStatRepository.findAll();
  }

  async getWithFilters(
    filters: IDailyStatFilters
  ): Promise<{ data: DailyStat[]; total: number; meta: ReturnType<typeof ApiResponse.buildPaginationMeta> }> {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;

    const { data, total } = await this.dailyStatRepository.findWithFilters({
      ...filters,
      page,
      limit,
    });

    const meta = ApiResponse.buildPaginationMeta(total, page, limit);
    return { data, total, meta }
  }

  async getById(id: string): Promise<DailyStat> {
    const stat = await this.dailyStatRepository.findById(id);
    if (!stat) throw new NotFoundError('DailyStat');
    return stat;
  }

  async getByUserId(userId: string): Promise<DailyStat[]> {
    return this.dailyStatRepository.findByUserId(userId);
  }

  async create(data: ICreateDailyStat): Promise<DailyStat> {
    return this.dailyStatRepository.create(data);
  }

  async update(id: string, data: IUpdateDailyStat): Promise<DailyStat> {
    await this.getById(id);
    return this.dailyStatRepository.update(id, data);
  }

  async delete(id: string): Promise<DailyStat> {
    await this.getById(id);
    return this.dailyStatRepository.delete(id);
  }

  async updateBalance(data: IUpdateBalance): Promise<DailyStat> {
    const stat = await this.dailyStatRepository.findOne({ day: data.day });
    const isIncome = data.type === 'INCOME';

    if (stat) {
      return this.dailyStatRepository.update(stat.id, {
        balance: isIncome ? stat.balance + data.amount : stat.balance - data.amount,
        income: isIncome ? stat.income + data.amount : stat.income,
        expense: !isIncome ? stat.expense + data.amount : stat.expense,
        incomeCount: isIncome ? stat.incomeCount + 1 : stat.incomeCount,
        expenseCount: !isIncome ? stat.expenseCount + 1 : stat.expenseCount,
      });
    }

    return await this.dailyStatRepository.create({
      day: data.day,
      date: data.date,
      income: isIncome ? data.amount : 0,
      expense: !isIncome ? data.amount : 0,
      balance: isIncome ? data.amount : -data.amount,
      incomeCount: isIncome ? 1 : 0,
      expenseCount: !isIncome ? 1 : 0,
      userId: data.userId,
    });
  }

  async revertBalance(day: string, amount: number, type: TransactionType) {
    const stat = await this.findOne({ day });
    const isIncome = type === 'INCOME';

    return await this.update(stat.id, {
      balance: isIncome ? stat.balance - amount : stat.balance + amount,
      income: isIncome ? stat.income - amount : stat.income,
      expense: !isIncome ? stat.expense - amount : stat.expense,
      incomeCount: isIncome ? stat.incomeCount - 1 : stat.incomeCount,
      expenseCount: !isIncome ? stat.expenseCount - 1 : stat.expenseCount,
    });
  }
}