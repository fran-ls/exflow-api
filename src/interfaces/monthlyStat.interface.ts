import { TransactionType } from "../generated/prisma/enums";

export interface IMonthlyStat {
  id: string;
  month: string;
  income: number;
  expense: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateMonthlyStat {
  month: string;
  income: number;
  expense: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
  userId: string;
}

export interface IUpdateMonthlyStat {
  month?: string;
  income?: number;
  expense?: number;
  balance?: number;
  incomeCount?: number;
  expenseCount?: number;
}

export interface IUpdateBalance {
  month: string;
  type: TransactionType;
  amount: number;
  userId: string
}

export interface IMonthlyStatFilters {
  month?: string;
  userId?: string;
  page?: number;
  limit?: number;
  orderBy?: 'month' | 'incomeCount' | 'expenseCount' | 'createdAt';
  order?: 'asc' | 'desc';
}