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

      data.push({
        day,
        items: transactions.data,
        meta: transactions.meta,
      });
    }

    return data;
  }

  async getWeeklySummary(): Promise<DashboardStat> {
    let totals: DashboardStat = {
      income: 0,
      expense: 0,
      balance: 0,
      transactionCount: 0,
    }

    for (const date of this.last7Days) {
      const day = getFmtDate(date, 'yyyy-MM-dd');
      const { data } = await this.dailyStatService.getWithFilters({ day });

      const stat = data?.[0];

      if (stat) {
        totals.income += stat.income;
        totals.expense += stat.expense;
        totals.transactionCount += stat.transactionCount;
      }
    }

    totals.balance = totals.income - totals.expense;

    return totals;
  }

  async getWallets(): Promise<Wallet[]> {
    const { data } = await this.walletService.getWithFilters({
      // orderBy: 'transactionCount',
      order: 'desc',
      limit: 5
    });
    console.log(data)
    return data;
  }
}