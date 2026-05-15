import { Prisma, TransactionType, YearlyStat } from '../generated/prisma/client';
import { prisma } from '../database/prisma';
import { BaseRepository } from './base.repository';
import {
  ICreateYearlyStat,
  IUpdateYearlyStat,
  IYearlyStatFilters,
} from '../interfaces/yearlyStat.interface';

export class YearlyStatRepository extends BaseRepository<
  YearlyStat,
  ICreateYearlyStat,
  IUpdateYearlyStat,
  IYearlyStatFilters
> {
  async execute(query: string): Promise<any> {
    return await prisma.$queryRawUnsafe(query);
  }

  async findOne(filters: Prisma.YearlyStatWhereInput): Promise<YearlyStat | null> {
    return prisma.yearlyStat.findFirst({
      where: filters,
      include: { user: false },
    });
  }

  async findAll(): Promise<YearlyStat[]> {
    return prisma.yearlyStat.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: false },
    });
  }

  async findWithFilters(
    filters: IYearlyStatFilters
  ): Promise<{ data: YearlyStat[]; total: number }> {
    const {
      userId,
      page = 1,
      limit = 10,
      orderBy = 'createdAt',
      order = 'desc',
    } = filters;

    const where: Prisma.YearlyStatWhereInput = {}

    if (userId) where.userId = userId;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.yearlyStat.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: order },
      }),
      prisma.yearlyStat.count({ where }),
    ]);

    return { data, total }
  }

  async findById(id: string): Promise<YearlyStat | null> {
    return prisma.yearlyStat.findUnique({
      where: { id },
      include: { user: false },
    });
  }

  async findByUserId(userId: string): Promise<YearlyStat[]> {
    return prisma.yearlyStat.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: ICreateYearlyStat): Promise<YearlyStat> {
    return prisma.yearlyStat.create({
      data,
    });
  }

  async update(id: string, data: IUpdateYearlyStat): Promise<YearlyStat> {
    return prisma.yearlyStat.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<YearlyStat> {
    return prisma.yearlyStat.delete({ where: { id } });
  }

  async updateBalance(year: number, amount: number, type: TransactionType): Promise<YearlyStat> {
    const stat = await prisma.yearlyStat.findUniqueOrThrow({ where: { year } });
    const isIncome = type === 'INCOME';

    return prisma.yearlyStat.update({
      where: { year },
      data: {
        balance: isIncome ? stat.balance + amount : stat.balance - amount,
        income: isIncome ? stat.income + amount : stat.income,
        expense: !isIncome ? stat.expense + amount : stat.expense,
        incomeCount: isIncome ? stat.incomeCount + 1 : stat.incomeCount,
        expenseCount: !isIncome ? stat.expenseCount + 1 : stat.expenseCount,
      },
    });
  }

  async revertBalance(year: number, amount: number, type: TransactionType): Promise<YearlyStat> {
    const stat = await prisma.yearlyStat.findUniqueOrThrow({ where: { year } });
    const isIncome = type === 'INCOME';

    return prisma.yearlyStat.update({
      where: { year },
      data: {
        balance: isIncome ? stat.balance - amount : stat.balance + amount,
        income: isIncome ? stat.income - amount : stat.income,
        expense: !isIncome ? stat.expense - amount : stat.expense,
        incomeCount: isIncome ? stat.incomeCount - 1 : stat.incomeCount,
        expenseCount: !isIncome ? stat.expenseCount - 1 : stat.expenseCount,
      },
    });
  }
}