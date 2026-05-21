import type { WeekDayMock } from "../../data/mock.types";
import { WEEK_DAYS } from "../../data/mock.types";
import { TRANSACTION_MOCK } from "../../data/transactionMock.data";
import { ICreateTransaction } from "../../interfaces/transaction.interface";
import { UserRepository } from "../../repositories/user.repository";
import { WalletRepository } from "../../repositories/wallet.repository";
import { TransactionService } from "../../services/transaction.service";
import { NotFoundError, ValidationError } from "../appError";
import { randomDateLast7Days } from "../randomDate";

interface ISaveTransaction {
  weekday?: WeekDayMock | 'All';
  userId: string;
}

export const saveTransactionMock = async (payload: ISaveTransaction) => {
  const { weekday = 'all', userId } = payload;

  if (!userId) throw new ValidationError('userId is required');

  const userRepository = new UserRepository();
  const walletRepository = new WalletRepository();
  const transactionService = new TransactionService();

  const day = weekday ? weekday[0].toUpperCase() + weekday.slice(1).toLowerCase() : weekday;
  if (!WEEK_DAYS.includes(day as any)) throw new ValidationError('invalid weekday');

  const user = await userRepository.findById(userId);
  if (!user) throw new NotFoundError('User');

  const walletIds = (await walletRepository.findWithFilters({ userId })).data.map(w => w.id);
  if (!walletIds.length) throw new ValidationError('No user wallets');

  const getWalletId = () => {
    const index = walletIds.length > 1 ? Math.floor(Math.random() * walletIds.length) : 0;
    return walletIds[index];
  }

  const data = TRANSACTION_MOCK;

  if (day !== 'All' && day in data) {
    const transactions = data[day as WeekDayMock].map(async (t) => {
      const [date, time] = randomDateLast7Days().split('T');
      const [year, month, day] = date.split('-').map(Number);

      const item: ICreateTransaction = {
        title: t.title,
        amount: t.amount,
        type: t.type,
        date,
        time,
        year,
        month,
        day,
        userId: user.id,
        walletId: getWalletId(),
      }

      if (t.description) item.description = t.description;

      return await transactionService.create(item);
    });

    await Promise.all(transactions);

    return {
      message: 'transactions saved'
    }
  }

  const items: any[] = [];

  for (const [, transactions] of Object.entries(data)) {
    transactions.forEach(async (t) => {
      const [date, time] = randomDateLast7Days().split('T');
      const [year, month, day] = date.split('-').map(Number);

      const item: ICreateTransaction = {
        title: t.title,
        amount: t.amount,
        type: t.type,
        date,
        time,
        year,
        month,
        day,
        userId: user.id,
        walletId: getWalletId(),
      }

      if (t.description) item.description = t.description;

      items.push(await transactionService.create(item));
    });
  }

  await Promise.all(items);

  return {
    message: 'transactions saved'
  }
}