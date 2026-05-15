import { subDays } from "date-fns";
import { Wallet } from "../generated/prisma/client";
import { DashboardStat, TransactionByDay } from "../interfaces/dashboard.interface";
import { TransactionService } from "./transaction.service";
import { DailyStatService } from "./dailyStat.service";
import { WalletService } from "./wallet.service";
import { getFmtDate } from "../utils/fmtDate";
import { MonthlyStatService } from "./monthlyStat.service";

export class DashboardService {
  private transactionService: TransactionService;
  private dailyStatService: DailyStatService;
  private monthlyStatService: MonthlyStatService;
  private walletService: WalletService;
  private readonly last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i));

  constructor() {
    this.walletService = new WalletService();
    this.transactionService = new TransactionService();
    this.dailyStatService = new DailyStatService();
    this.monthlyStatService = new MonthlyStatService();
  }

  async getWeeklyTransactions(userId: string): Promise<TransactionByDay[]> {
    const data: TransactionByDay[] = [];

    for (const date of this.last7Days) {
      const day = getFmtDate(date, 'yyyy-MM-dd');
      const transactions = await this.transactionService.getWithFilters({
        userId,
        date: day
      });

      const statResult = await this.dailyStatService.getWithFilters({ userId, day });
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

  async getMonthlySummary(userId: string): Promise<DashboardStat> {
    const nowDate = new Date();
    const fixMonth = `${nowDate.getMonth() + 1}`.padStart(2, '0');
    const month = `${nowDate.getFullYear()}-${fixMonth}`;

    const stat = await this.monthlyStatService.getWithFilters({ userId, month });
    const data = stat.data[0];

    const fields = 'income expense balance incomeCount expenseCount'.split(' ');
    const totals: DashboardStat = {
      income: 0,
      expense: 0,
      balance: 0,
      incomeCount: 0,
      expenseCount: 0
    }

    data && fields.forEach((f) => {
      const k = f as keyof DashboardStat;
      totals[k] = data[k];
    });

    return totals;
  }

  async getWeeklySummary(userId: string): Promise<DashboardStat> {
    let totals: DashboardStat = {
      income: 0,
      expense: 0,
      balance: 0,
      incomeCount: 0,
      expenseCount: 0
    }

    for (const date of this.last7Days) {
      const day = getFmtDate(date, 'yyyy-MM-dd');
      const { data } = await this.dailyStatService.getWithFilters({ userId, day });

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

  async getFrequentWallets(userId: string): Promise<Wallet[]> {
    const wallets = await this.walletService.query(`
      SELECT *, (income_count + expense_count) AS transaction_count
      FROM "wallets"
      WHERE user_id = '${userId}'
      ORDER BY transaction_count DESC
      LIMIT 5
    `);

    return wallets.map(this.objToCamelCase);
  }

  async getTotals(userId: string) {
    const [{ total_balance }] = await this.walletService.query<[{ total_balance: number }]>(`
      SELECT SUM(balance) AS total_balance
      FROM "wallets"
      WHERE user_id = '${userId}'
    `);

    const [{ wallet_count }] = await this.walletService.query<[{ wallet_count: number }]>(`
      SELECT COUNT(*) AS wallet_count
      FROM "wallets"
      WHERE user_id = '${userId}'
    `);

    return {
      balance: total_balance,
      walletCount: Number(wallet_count)
    }
  }

  objToCamelCase<T>(obj: { [key: string]: any }) {
    const omitKeys = ['createdAt', 'created_at', 'updatedAt', 'updated_at']

    function snakeToCamel(str: string) {
      return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    }

    function toCamel(obj: { [key: string]: any }): any {
      const convert = () => {
        return Object.keys(obj).reduce((acc, key) => {
          const camelKey = snakeToCamel(key);
          acc[camelKey] = !omitKeys.includes(key) ? toCamel(obj[key]) : obj[key];
          return acc;
        }, {} as any) as T;
      }

      if (Array.isArray(obj)) {
        return obj.map(toCamel);
      } else if (obj !== null && typeof obj === 'object') {
        return convert();
      }

      return obj as T;
    }

    return toCamel(obj);
  }
}