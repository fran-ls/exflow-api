import { WEEK_DAYS, WeekDayMock } from "../../data/mock.types";
import { TRANSACTION_MOCK } from "../../data/transactionMock.data";
import { WALLET_MOCK } from "../../data/walletMock";
import { prisma } from "../../database/prisma";
import { Transaction } from "../../generated/prisma/client";
import { ICreateTransaction } from "../../interfaces/transaction.interface";
import { AnalyticService } from "../../services/analytic.service";
import { DailyStatService } from "../../services/dailyStat.service";
import { MonthlyStatService } from "../../services/monthlyStat.service";
import { YearlyStatService } from "../../services/yearlyStat.service";
import { NotFoundError, ValidationError } from "../appError";
import { randomDateLast7Days } from "../randomDate";
import { SeedAction, SeedDB } from "./seed.db";

const analyticService = new AnalyticService();

const daliyService = new DailyStatService();
const monthlyService = new MonthlyStatService();
const yearlyService = new YearlyStatService();

const seed = new SeedDB();

type Action = SeedAction;

type Args = {
  userId: string;
  action: Action;
}

export class SeedMock {
  async execute(args: Args) {
    const { userId, action } = args;

    switch (action) {
      case 'SAVE_WALLETS':
        return this.saveWallets(userId);
      case 'SAVE_TRANSACTIONS':
        return this.saveTransactions(userId);
      case 'UPDATE_WALLETS':
        return seed.updateWalletStats(userId);
      case 'SAVE_STATS':
        return this.saveStats(userId);
      case 'YEAR_SUMMARY':
        return analyticService.getTransactionSummary({ userId });
      default:
        throw new ValidationError('Invalid action');
    }
  }

  async saveStats(userId: string) {
    daliyService.changeStats({ userId }, 'update');
    monthlyService.changeStats({ userId }, 'update');
    yearlyService.changeStats({ userId }, 'update');
  }

  async saveTransactions(userId: string, weekday: WeekDayMock | 'All' = 'All') {
    if (!userId) throw new ValidationError('userId is required');

    const day = weekday ? weekday[0].toUpperCase() + weekday.slice(1).toLowerCase() : weekday;
    if (![...WEEK_DAYS, 'All'].includes(day as any)) throw new ValidationError('Invalid weekday');

    const user = await prisma.user.findFirst({ where: { id: userId } });
    if (!user) throw new NotFoundError('User');

    const walletIds = (await prisma.wallet.findMany({ where: { userId } })).map(w => w.id);
    if (!walletIds.length) throw new ValidationError('No user wallets');

    const getWalletId = () => {
      const index = walletIds.length > 1 ? Math.floor(Math.random() * walletIds.length) : 0;
      return walletIds[index];
    }

    const getNewTransaction = (data: Record<string, any>): ICreateTransaction => {
      const d = data;
      const [date] = randomDateLast7Days().split('T');
      const [year, month, day] = date.split('-').map(Number);
      const [hours = 0, minutes = 0] = d.time?.split(':').map(Number);
      return {
        title: d.title,
        amount: d.amount,
        type: d.type,
        date: new Date(year, month - 1, day, hours, minutes),
        time: d.time,
        year, month, day,
        userId: user.id,
        walletId: getWalletId(),
        ...(d.description && {
          description: d.description
        })
      }
    }

    const data = TRANSACTION_MOCK;

    if (day !== 'All' && day in data) {
      const transactions = data[day as WeekDayMock].map(async (t) => {
        const item = getNewTransaction(t);
        return await prisma.transaction.create({ data: item });
      });

      return await Promise.all(transactions);
    }

    const items: Transaction[] = [];

    for (const [wkday, transactions] of Object.entries(data)) {
      for (const t of transactions) {
        const item = getNewTransaction(t);
        items.push(await prisma.transaction.create({ data: item }));
      }
    }

    return items;
  }

  async saveWallets(userId: string) {
    if (!userId) throw new ValidationError('userId is required');

    const wallets = WALLET_MOCK.map(async (w) => (
      await prisma.wallet.create({
        data: {
          name: w.name,
          type: w.type,
          color: w.color,
          balance: w.initBalance,
          initBalance: w.initBalance,
          income: 0,
          expense: 0,
          incomeCount: 0,
          expenseCount: 0,
          userId
        }
      })
    ));

    return await Promise.all(wallets);
  }
}