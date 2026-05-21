import { ICreateTransaction } from "../interfaces/transaction.interface";

export type TransactionMock = Omit<ICreateTransaction, 'id' | 'year' | 'month' | 'day' | 'userId'>;

// type TransactionType = (typeof TransactionType)[keyof typeof TransactionType]

// const TransactionType = {
//   INCOME: 'INCOME',
//   EXPENSE: 'EXPENSE'
// } as const;

export type WeekDayMock =
  'Monday' | 'Tuesday' | 'Wednesday' |
  'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export const WEEK_DAYS: WeekDayMock[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];