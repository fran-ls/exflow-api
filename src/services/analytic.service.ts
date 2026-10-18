import { prisma } from "../database/prisma";
import { ITransactionFilters } from "../interfaces/transaction.interface";
import { TransactionType } from "../generated/prisma/enums";
import { TransactionWhereInput } from "../generated/prisma/models";
import { getFmtDate } from "../utils/fmtDate";
import { ValidationError } from "../utils/appError";

export class AnalyticService {
  private readonly transactionRepository = prisma.transaction;

  async getYearSummary(filters: ITransactionFilters) {
    const { userId, dateFrom, dateTo, type } = filters;

    const where: TransactionWhereInput = {
      userId,
      type,
      date: {
        gte: dateFrom,
        lte: dateTo
      }
    }

    const totals = await this.getYearTransactionTotals(where);

    const transactions = await this.transactionRepository.findMany({
      where,
      take: 10,
      include: {
        wallet: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    const monthlyTotals = await this.transactionRepository.groupBy({
      by: ['year', 'month', 'type'],
      where,
      _sum: { amount: true },
      orderBy: { month: 'asc' }
    });

    const summary = monthlyTotals.reduce((acc, row) => {
      const month = `${row.year}/${row.month < 10 ? '0' : ''}${row.month}`;
      if (!acc[month]) {
        acc[month] = {
          month,
          monthName: getFmtDate(new Date(row.year, row.month - 1, 1), 'MMMM'),
          income: 0,
          expense: 0
        };
      }
      const type = row.type === TransactionType.INCOME ? 'income' : 'expense';
      acc[month][type] = row._sum.amount ?? 0;
      return acc;
    }, {} as Record<string, {
      monthName: string;
      month: string;
      income: number;
      expense: number;
    }>);

    return {
      totals,
      transactions,
      summary
    }
  }

  async getYearTransactionTotals(where: TransactionWhereInput) {
    const [incomeAgg, expenseAgg] = await Promise.all([
      this.transactionRepository.aggregate({
        where: { ...where, type: TransactionType.INCOME },
        _sum: { amount: true },
        _count: true
      }),
      this.transactionRepository.aggregate({
        where: { ...where, type: TransactionType.EXPENSE },
        _sum: { amount: true },
        _count: true
      })
    ]);

    return {
      items: incomeAgg._count + expenseAgg._count,
      income: incomeAgg._sum.amount,
      expense: expenseAgg._sum.amount,
      incomeCount: incomeAgg._count,
      expenseCount: expenseAgg._count
    }
  }

  async getTransactionSummary(filters?: ITransactionFilters) {
    const { userId, date } = filters || {};
    if (!userId) throw new ValidationError('User not found');

    const where: TransactionWhereInput = { userId }

    if (date) {
      const [year, month, day] = (date).split('-').map(Number);
      where.date = new Date(year, month - 1, day);
    }

    const data = await prisma.transaction.findMany({ where });

    type Item = {
      income: number;
      expense: number;
      incomeCount: number;
      expenseCount: number;
    }

    const stats = {
      days: {} as Record<string, Item & { date: string }>,
      months: {} as Record<string, Item & { month: string }>,
      years: {} as Record<string, Item & { year: number }>
    }

    for (const t of data) {
      const date = getFmtDate(new Date(t.year, t.month - 1, t.day), 'yyyy-MM-dd');
      const month = date.slice(0, 7);

      if (!stats.days[date]) stats.days[date] = {
        date,
        income: 0,
        expense: 0,
        incomeCount: 0,
        expenseCount: 0
      }
      if (!stats.months[month]) stats.months[month] = {
        month,
        income: 0,
        expense: 0,
        incomeCount: 0,
        expenseCount: 0
      }
      if (!stats.years[t.year]) stats.years[t.year] = {
        year: t.year,
        income: 0,
        expense: 0,
        incomeCount: 0,
        expenseCount: 0
      }

      if (t.type === 'INCOME') {
        stats.days[date].income += t.amount;
        stats.days[date].incomeCount += 1;

        stats.months[month].income += t.amount;
        stats.months[month].incomeCount += 1;

        stats.years[t.year].income += t.amount;
        stats.years[t.year].incomeCount += 1;
      }
      else if (t.type === 'EXPENSE') {
        stats.days[date].expense += t.amount;
        stats.days[date].expenseCount += 1;

        stats.months[month].expense += t.amount;
        stats.months[month].expenseCount += 1;

        stats.years[t.year].expense += t.amount;
        stats.years[t.year].expenseCount += 1;
      }
    }

    return stats;
  }
}