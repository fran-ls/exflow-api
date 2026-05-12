import { subDays } from "date-fns";
import { Wallet } from "../generated/prisma/client";
import { DashboardStat, TransactionByDay } from "../interfaces/dashboard.interface";
import { TransactionService } from "./transaction.service";
import { DailyStatService } from "./dailyStat.service";
import { WalletService } from "./wallet.service";
import { getFmtDate } from "../utils/fmtDate";

export class DashboardService {
  private transactionService: TransactionService;
  private dailyStatService: DailyStatService;
  private walletService: WalletService;
  private readonly last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i));

  constructor() {
    this.transactionService = new TransactionService();
    this.dailyStatService = new DailyStatService();
    this.walletService = new WalletService();
  }

  async getWeeklyTransactions(): Promise<TransactionByDay[]> {
    const data: TransactionByDay[] = [];

    for (const date of this.last7Days) {
      const day = getFmtDate(date, 'yyyy-MM-dd');
      const transactions = await this.transactionService.getWithFilters({ date: day });

      const statResult = await this.dailyStatService.getWithFilters({ day });
      const stat = statResult.data?.[0];

      data.push({
        day,
        items: transactions.data,
        meta: transactions.meta,
        totals: {
          income: stat?.income || 0,
          expense: stat?.expense || 0,
          incomeCount: stat?.incomeCount || 0,
          expenseCount: stat?.expenseCount || 0
        }
      });
    }

    return data;
  }

  async getWeeklySummary(): Promise<DashboardStat> {
    let totals: DashboardStat = {
      income: 0,
      expense: 0,
      balance: 0,
      incomeCount: 0,
      expenseCount: 0
    }

    for (const date of this.last7Days) {
      const day = getFmtDate(date, 'yyyy-MM-dd');
      const { data } = await this.dailyStatService.getWithFilters({ day });

      const stat = data?.[0];

      if (stat) {
        totals.income += stat.income;
        totals.expense += stat.expense;
        totals.incomeCount += stat.incomeCount;
        totals.expenseCount += stat.expenseCount;
      }
    }

    totals.balance = totals.income - totals.expense;

    return totals;
  }

  async getWallets(): Promise<Wallet[]> {
    const { data } = await this.walletService.getWithFilters({
      limit: 5
    });

    return data.sort((a, b) => (
      (b.incomeCount + b.expenseCount) - (a.incomeCount + a.expenseCount)
    ));
  }

  async getTotals() {
    const wallets = await this.walletService.getAll();

    return {
      balance: wallets.reduce((sum, w) => sum + w.balance, 0),
      walletCount: wallets.length
    }
  }
}