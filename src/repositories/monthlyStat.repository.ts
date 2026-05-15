import { MonthlyStat, Prisma, TransactionType } from '../generated/prisma/client';
import { prisma } from '../database/prisma';
import { BaseRepository } from './base.repository';
import {
  ICreateMonthlyStat,
  IUpdateMonthlyStat,
  IMonthlyStatFilters,
} from '../interfaces/monthlyStat.interface';

export class MonthlyStatRepository extends BaseRepository<
  MonthlyStat,
  ICreateMonthlyStat,
  IUpdateMonthlyStat,
  IMonthlyStatFilters
> {
  async execute(query: string): Promise<any> {
    return await prisma.$queryRawUnsafe(query);
  }

  async findOne(filters: Prisma.MonthlyStatWhereInput): Promise<MonthlyStat | null> {
    return prisma.monthlyStat.findFirst({
      where: filters,
      include: { user: false },
    });
  }

  async findAll(): Promise<MonthlyStat[]> {
    return prisma.monthlyStat.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: false },
    });
  }

  async findWithFilters(
    filters: IMonthlyStatFilters
  ): Promise<{ data: MonthlyStat[]; total: number }> {
    const {
      month,
      userId,
      page = 1,
      limit = 10,
      orderBy = 'createdAt',
      order = 'desc',
    } = filters;

    const where: Prisma.MonthlyStatWhereInput = {}

    if (userId) where.userId = userId;
    if (month) where.month = month;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.monthlyStat.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: order },
      }),
      prisma.monthlyStat.count({ where }),
    ]);

    return { data, total }
  }

  async findById(id: string): Promise<MonthlyStat | null> {
    return prisma.monthlyStat.findUnique({
      where: { id },
      include: { user: false },
    });
  }

  async findByUserId(userId: string): Promise<MonthlyStat[]> {
    return prisma.monthlyStat.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: ICreateMonthlyStat): Promise<MonthlyStat> {
    return prisma.monthlyStat.create({
      data,
    });
  }

  async update(id: string, data: IUpdateMonthlyStat): Promise<MonthlyStat> {
    return prisma.monthlyStat.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<MonthlyStat> {
    return prisma.monthlyStat.delete({ where: { id } });
  }

  async updateBalance(month: string, amount: number, type: TransactionType): Promise<MonthlyStat> {
    const stat = await prisma.monthlyStat.findUniqueOrThrow({ where: { month } });
    const isIncome = type === 'INCOME';

    return prisma.monthlyStat.update({
      where: { month },
      data: {
        balance: isIncome ? stat.balance + amount : stat.balance - amount,
        income: isIncome ? stat.income + amount : stat.income,
        expense: !isIncome ? stat.expense + amount : stat.expense,
        incomeCount: isIncome ? stat.incomeCount + 1 : stat.incomeCount,
        expenseCount: !isIncome ? stat.expenseCount + 1 : stat.expenseCount,
      },
    });
  }

  async revertBalance(month: string, amount: number, type: TransactionType): Promise<MonthlyStat> {
    const stat = await prisma.monthlyStat.findUniqueOrThrow({ where: { month } });
    const isIncome = type === 'INCOME';

    return prisma.monthlyStat.update({
      where: { month },
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