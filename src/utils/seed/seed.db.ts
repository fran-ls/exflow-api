import { transactionsMock } from "../../data/transactions.mock";
import { WALLET_MOCK } from "../../data/walletMock";
import { prisma } from "../../database/prisma";
import { Transaction, TransactionType, Wallet } from "../../generated/prisma/client";
import { ICreateTransaction } from "../../interfaces/transaction.interface";
import { AnalyticService } from "../../services/analytic.service";
import { NotFoundError, ValidationError } from "../appError";

const analyticService = new AnalyticService();

export type SeedAction =
  'SAVE_WALLETS' | 'SAVE_TRANSACTIONS' |
  'UPDATE_WALLETS' | 'SAVE_STATS' | 'YEAR_SUMMARY';

export class SeedDB {
  execute(userId: string, action: SeedAction) {
    switch (action) {
      case 'SAVE_WALLETS':
        return this.saveWallets(userId);
      case 'SAVE_TRANSACTIONS':
        return this.saveTransactions(userId);
      case 'UPDATE_WALLETS':
        return this.updateWalletStats(userId);
      case 'YEAR_SUMMARY':
        return analyticService.getTransactionSummary({ userId });
      default:
        throw new ValidationError('Invalid action');
    }
  }

  async updateStats(userId: string) {
    const wallets = await prisma.wallet.findMany({
      where: { userId }
    });

    async function updateDaily(wallet: Wallet, items: Transaction[]) {
      for (const it of items) {
        const day = `${it.year}-${it.month.toString().padStart(2, '0')}-${it.day.toString().padStart(2, '0')}`

        const daily = await prisma.dailyStat.findFirst({
          where: {
            AND: [
              { userId },
              { day: { equals: day } }
            ]
          },
        });

        if (daily) {
          await prisma.dailyStat.update({
            where: { id: daily.id },
            data: {
              ...(it.type === TransactionType.INCOME && {
                balance: daily.balance + it.amount,
                income: daily.income + it.amount,
                incomeCount: daily.incomeCount + 1
              }),
              ...(it.type === TransactionType.EXPENSE && {
                balance: daily.balance - it.amount,
                expense: daily.expense + it.amount,
                expenseCount: daily.expenseCount + 1
              })
            }
          });
        }
        else {
          await prisma.dailyStat.create({
            data: {
              userId,
              day,
              date: it.date,
              balance: wallet.balance,
              ...(it.type === TransactionType.INCOME && {
                income: it.amount,
                incomeCount: 1
              }),
              ...(it.type === TransactionType.EXPENSE && {
                expense: it.amount,
                expenseCount: 1
              })
            }
          });
        }
      }
    }

    async function updateMonthly(wallet: Wallet, items: Transaction[]) {
      for (const it of items) {
        const month = `${it.year}-${it.month.toString().padStart(2, '0')}`

        const stat = await prisma.monthlyStat.findFirst({
          where: {
            AND: [
              { userId },
              { month: { equals: month } }
            ]
          },
        });

        if (stat) {
          await prisma.monthlyStat.update({
            where: { id: stat.id },
            data: {
              ...(it.type === TransactionType.INCOME && {
                balance: stat.balance + it.amount,
                income: stat.income + it.amount,
                incomeCount: stat.incomeCount + 1
              }),
              ...(it.type === TransactionType.EXPENSE && {
                balance: stat.balance - it.amount,
                expense: stat.expense + it.amount,
                expenseCount: stat.expenseCount + 1
              })
            }
          });
        }
        else {
          await prisma.monthlyStat.create({
            data: {
              userId,
              month,
              balance: wallet.balance,
              ...(it.type === TransactionType.INCOME && {
                income: it.amount,
                incomeCount: 1
              }),
              ...(it.type === TransactionType.EXPENSE && {
                expense: it.amount,
                expenseCount: 1
              })
            }
          });
        }
      }
    }

    async function updateYearly(wallet: Wallet, items: Transaction[]) {
      for (const it of items) {
        const stat = await prisma.yearlyStat.findFirst({
          where: {
            AND: [
              { userId },
              { year: { equals: it.year } }
            ]
          },
        });

        if (stat) {
          await prisma.yearlyStat.update({
            where: { id: stat.id },
            data: {
              ...(it.type === TransactionType.INCOME && {
                balance: stat.balance + it.amount,
                income: stat.income + it.amount,
                incomeCount: stat.incomeCount + 1
              }),
              ...(it.type === TransactionType.EXPENSE && {
                balance: stat.balance - it.amount,
                expense: stat.expense + it.amount,
                expenseCount: stat.expenseCount + 1
              })
            }
          });
        }
        else {
          await prisma.yearlyStat.create({
            data: {
              userId,
              year: it.year,
              balance: wallet.balance,
              ...(it.type === TransactionType.INCOME && {
                income: it.amount,
                incomeCount: 1
              }),
              ...(it.type === TransactionType.EXPENSE && {
                expense: it.amount,
                expenseCount: 1
              })
            }
          });
        }
      }
    }

    const result = wallets.map(async (w) => {
      const [transactions, incomeCount, expenseCount, incomeAgg = 0, expenseAgg = 0] = await Promise.all([
        await prisma.transaction.findMany({ where: { userId, walletId: w.id, } }),
        await prisma.transaction.count({ where: { userId, walletId: w.id, type: 'INCOME' } }),
        await prisma.transaction.count({ where: { userId, walletId: w.id, type: 'EXPENSE' } }),
        await prisma.transaction.aggregate({
          where: {
            userId,
            walletId: w.id,
            type: 'INCOME',
          },
          _sum: { amount: true }
        }),
        await prisma.transaction.aggregate({
          where: {
            userId,
            walletId: w.id,
            type: 'EXPENSE',
          },
          _sum: { amount: true }
        })
      ]);

      const meta = {
        income: (incomeAgg as any)._sum.amount || 0,
        expense: (expenseAgg as any)._sum.amount || 0,
        incomeCount,
        expenseCount,
        items: transactions.length
      }

      updateDaily(w, transactions);
      updateMonthly(w, transactions);
      updateYearly(w, transactions);
      return meta;
    });

    return await Promise.all(result);
  }

  async updateWalletStats(userId: string) {
    if (!userId) throw new ValidationError('userId is required');

    const wallets = await prisma.wallet.findMany({ where: { userId } });

    const result = wallets.map(async (w) => {
      const [transactions, incomeCount, expenseCount, incomeAgg = 0, expenseAgg = 0] = await Promise.all([
        await prisma.transaction.findMany({ where: { userId, walletId: w.id, } }),
        await prisma.transaction.count({ where: { userId, walletId: w.id, type: 'INCOME' } }),
        await prisma.transaction.count({ where: { userId, walletId: w.id, type: 'EXPENSE' } }),
        await prisma.transaction.aggregate({
          where: {
            userId,
            walletId: w.id,
            type: 'INCOME',
          },
          _sum: { amount: true }
        }),
        await prisma.transaction.aggregate({
          where: {
            userId,
            walletId: w.id,
            type: 'EXPENSE',
          },
          _sum: { amount: true }
        })
      ]);

      const walletMeta = {
        income: (incomeAgg as any)._sum.amount || 0,
        expense: (expenseAgg as any)._sum.amount || 0,
        incomeCount,
        expenseCount,
        items: transactions.length
      }

      await prisma.wallet.update({
        where: { id: w.id },
        data: {
          balance: w.balance + walletMeta.income - walletMeta.expense,
          expense: walletMeta.expense,
          income: walletMeta.income,
          expenseCount: walletMeta.expenseCount,
          incomeCount: walletMeta.incomeCount
        }
      });

      return walletMeta;
    });

    return await Promise.all(result);
  }

  async saveTransactions(userId: string) {
    if (!userId) throw new ValidationError('userId is required');

    const user = await prisma.user.findFirst({ where: { id: userId } });
    if (!user) throw new NotFoundError('User');

    const walletIds = (await prisma.wallet.findMany({ where: { userId } })).map(w => w.id);
    if (!walletIds.length) throw new ValidationError('No user wallets');

    const getWalletId = () => {
      const index = walletIds.length > 1 ? Math.floor(Math.random() * walletIds.length) : 0;
      return walletIds[index];
    }

    const items = transactionsMock.map(async (t) => {
      const [year, month, day] = t.date.split('-').map(Number);
      const [hours, minutes] = t.date.split(':').map(Number);

      const newTransaction: ICreateTransaction = {
        title: t.title,
        amount: Number(t.amount),
        type: t.type,
        date: new Date(year, month - 1, day, hours, minutes),
        time: t.time,
        year, month, day,
        userId: user.id,
        walletId: getWalletId(),
        ...(t.description && {
          description: t.description
        })
      }

      return newTransaction;
      // return await prisma.transaction.create({ data: newTransaction });
    });

    return await Promise.all(items);
  }

  async saveWallets(userId: string) {
    if (!userId) throw new ValidationError('userId is required');

    const wallets = WALLET_MOCK.map(async (w) => {
      const balance = 3000 //w.initBalance;
      return await prisma.wallet.create({
        data: {
          name: w.name,
          type: w.type,
          color: w.color,
          initBalance: balance,
          balance: balance,
          income: 0,
          expense: 0,
          incomeCount: 0,
          expenseCount: 0,
          userId
        }
      })
    });

    return await Promise.all(wallets);
  }

  getTotals() {
    const totals = {
      income: 0,
      expense: 0,
      min: 0,
      max: 0,
    }

    for (const t of transactionsMock) {
      const amount = Number(t.amount);

      if (t.type === 'INCOME') {
        totals.income += amount;
      }
      else if (t.type === 'EXPENSE') {
        totals.expense += amount;
      }

      if (totals.min === 0 || amount < totals.min) {
        totals.min = amount;
      }
      if (amount > totals.max) {
        totals.max = amount;
      }
    }

    return totals;
  }
}