import { Prisma, TransactionType } from '../generated/prisma/client';
import { prisma } from '../database/prisma';
import { BaseRepository } from './base.repository';
import {
  IDailyStat,
  ICreateDailyStat,
  IUpdateDailyStat,
  IDailyStatFilters,
} from '../interfaces/dailyStat.interface';

export class DailyStatRepository extends BaseRepository<
  IDailyStat,
  ICreateDailyStat,
  IUpdateDailyStat,
  IDailyStatFilters
> {
  async findOne(filters: Prisma.DailyStatWhereInput): Promise<IDailyStat | null> {
    return prisma.dailyStat.findFirst({
      where: filters,
      include: { user: false },
    });
  }

  async findAll(): Promise<IDailyStat[]> {
    return prisma.dailyStat.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: false },
    });
  }

  async findWithFilters(
    filters: IDailyStatFilters
  ): Promise<{ data: IDailyStat[]; total: number }> {
    const {
      day,
      userId,
      page = 1,
      limit = 10,
      orderBy = 'createdAt',
      order = 'desc',
    } = filters;

    const where: Prisma.DailyStatWhereInput = {}

    if (userId) where.userId = userId;
    if (day) where.day = day;

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

  async findById(id: string): Promise<IDailyStat | null> {
    return prisma.dailyStat.findUnique({
      where: { id },
      include: { user: false },
    });
  }

  async findByUserId(userId: string): Promise<IDailyStat[]> {
    return prisma.dailyStat.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: ICreateDailyStat): Promise<IDailyStat> {
    return prisma.dailyStat.create({
      data,
    });
  }

  async update(id: string, data: IUpdateDailyStat): Promise<IDailyStat> {
    return prisma.dailyStat.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<IDailyStat> {
    return prisma.dailyStat.delete({ where: { id } });
  }

  async updateBalance(day: string, amount: number, type: TransactionType): Promise<IDailyStat> {
    const stat = await prisma.dailyStat.findUniqueOrThrow({ where: { day } });
    const isIncome = type === 'INCOME';

    return prisma.dailyStat.update({
      where: { day },
      data: {
        balance: isIncome ? stat.balance + amount : stat.balance - amount,
        income: isIncome ? stat.income + amount : stat.income,
        expense: !isIncome ? stat.expense + amount : stat.expense,
        transactionCount: stat.transactionCount + 1
      },
    });
  }

  async revertBalance(day: string, amount: number, type: TransactionType): Promise<IDailyStat> {
    const stat = await prisma.dailyStat.findUniqueOrThrow({ where: { day } });
    const isIncome = type === 'INCOME';

    return prisma.dailyStat.update({
      where: { day },
      data: {
        balance: isIncome ? stat.balance - amount : stat.balance + amount,
        income: isIncome ? stat.income - amount : stat.income,
        expense: !isIncome ? stat.expense - amount : stat.expense,
        transactionCount: stat.transactionCount - 1
      },
    });
  }
}