import { prisma } from "../database/prisma";
import { ITransactionFilters } from "../interfaces/transaction.interface";
import { TransactionType } from "../generated/prisma/enums";
import { TransactionWhereInput } from "../generated/prisma/models";
import { getFmtDate } from "../utils/fmtDate";

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
}