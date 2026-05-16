import { DailyStat, Prisma, TransactionType } from '../generated/prisma/client';
import { prisma } from '../database/prisma';
import { BaseRepository } from './base.repository';
import {
  ICreateDailyStat,
  IUpdateDailyStat,
  IDailyStatFilters,
} from '../interfaces/dailyStat.interface';

export class DailyStatRepository extends BaseRepository<
  DailyStat,
  ICreateDailyStat,
  IUpdateDailyStat,
  IDailyStatFilters
> {
  async execute(query: string): Promise<any> {
    return await prisma.$queryRawUnsafe(query);
  }

  async findOne(filters: Prisma.DailyStatWhereInput): Promise<DailyStat | null> {
    return prisma.dailyStat.findFirst({
      where: filters,
      include: { user: false },
    });
  }

  async findAll(): Promise<DailyStat[]> {
    return prisma.dailyStat.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: false },
    });
  }

  async findWithFilters(
    filters: IDailyStatFilters
  ): Promise<{ data: DailyStat[]; total: number }> {
    const {
      day,
      date,
      userId,
      page = 1,
      limit = 10,
      orderBy = 'createdAt',
      order = 'desc',
    } = filters;

    const where: Prisma.DailyStatWhereInput = {}

    if (userId) where.userId = userId;
    if (day) where.day = day;
    if (date) where.date = date;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.dailyStat.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: order },
      }),
      prisma.dailyStat.count({ where }),
    ]);

    return { data, total }
  }

  async findById(id: string): Promise<DailyStat | null> {
    return prisma.dailyStat.findUnique({
      where: { id },
      include: { user: false },
    });
  }

  async findByUserId(userId: string): Promise<DailyStat[]> {
    return prisma.dailyStat.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: ICreateDailyStat): Promise<DailyStat> {
    return prisma.dailyStat.create({
      data,
    });
  }

  async update(id: string, data: IUpdateDailyStat): Promise<DailyStat> {
    return prisma.dailyStat.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<DailyStat> {
    return prisma.dailyStat.delete({ where: { id } });
  }

  async updateBalance(userId: string, day: string, amount: number, type: TransactionType): Promise<DailyStat | null> {
    const stat = await prisma.dailyStat.findFirst({ where: { userId, day } });
    if (!stat) return null;

    const isIncome = type === 'INCOME';

    return prisma.dailyStat.update({
      where: { id: stat.id },
      data: {
        balance: isIncome ? stat.balance + amount : stat.balance - amount,
        income: isIncome ? stat.income + amount : stat.income,
        expense: !isIncome ? stat.expense + amount : stat.expense,
        incomeCount: isIncome ? stat.incomeCount + 1 : stat.incomeCount,
        expenseCount: !isIncome ? stat.expenseCount + 1 : stat.expenseCount,
      },
    });
  }

  async revertBalance(userId: string, day: string, amount: number, type: TransactionType): Promise<DailyStat | null> {
    const stat = await prisma.dailyStat.findFirst({ where: { userId, day } });
    if (!stat) return null;

    const isIncome = type === 'INCOME';

    return prisma.dailyStat.update({
      where: { id: stat.id },
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