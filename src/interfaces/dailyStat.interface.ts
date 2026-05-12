import { TransactionType } from "../generated/prisma/enums";

export interface IDailyStat {
  id: string;
  day: string;
  date: Date;
  income: number;
  expense: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateDailyStat {
  day: string;
  date: Date;
  income: number;
  expense: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
  userId: string;
}

export interface IUpdateDailyStat {
  day?: string;
  date?: Date;
  income?: number;
  expense?: number;
  balance?: number;
  incomeCount?: number;
  expenseCount?: number;
}

export interface IUpdateBalance {
  day: string;
  date: Date;
  type: TransactionType;
  amount: number;
  userId: string
}

export interface IDailyStatFilters {
  day?: string;
  date?: string;
  userId?: string;
  page?: number;
  limit?: number;
  orderBy?: 'day' | 'date' | 'incomeCount' | 'expenseCount' | 'createdAt';
  order?: 'asc' | 'desc';
}