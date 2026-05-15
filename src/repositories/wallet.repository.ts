import { Wallet, Prisma } from '../generated/prisma/client';
import { prisma } from '../database/prisma';
import { BaseRepository } from './base.repository';
import {
  ICreateWallet,
  IUpdateWallet,
  IWalletFilters,
} from '../interfaces/wallet.interface';

export class WalletRepository extends BaseRepository<
  Wallet,
  ICreateWallet,
  IUpdateWallet,
  IWalletFilters
> {
  async execute<T = any>(query: string): Promise<T> {
    return await prisma.$queryRawUnsafe<T>(query);
  }

  async findAll(): Promise<Wallet[]> {
    return prisma.wallet.findMany({
      orderBy: { createdAt: 'desc' },
      include: { transactions: false },
    });
  }

  async findWithFilters(
    filters: IWalletFilters
  ): Promise<{ data: Wallet[]; total: number }> {
    const {
      type,
      name,
      userId,
      minBalance,
      maxBalance,
      page = 1,
      limit = 10,
      orderBy = 'createdAt',
      order = 'desc',
    } = filters;

    const where: Prisma.WalletWhereInput = {}

    if (type) where.type = type;
    if (name) where.name = { contains: name, mode: 'insensitive' }
    if (userId) where.userId = userId;
    if (minBalance !== undefined || maxBalance !== undefined) {
      where.balance = {}
      if (minBalance !== undefined) where.balance.gte = minBalance;
      if (maxBalance !== undefined) where.balance.lte = maxBalance;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.wallet.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: order },
      }),
      prisma.wallet.count({ where }),
    ]);

    return { data, total }
  }

  async findById(id: string): Promise<Wallet | null> {
    return prisma.wallet.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async findByUserId(userId: string): Promise<Wallet[]> {
    return prisma.wallet.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: ICreateWallet): Promise<Wallet> {
    return prisma.wallet.create({
      data,
    });
  }

  async update(id: string, data: IUpdateWallet): Promise<Wallet> {
    return prisma.wallet.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Wallet> {
    return prisma.wallet.delete({ where: { id } });
  }

  async updateBalance(
    id: string,
    amount: number,
    type: 'INCOME' | 'EXPENSE'
  ): Promise<Wallet> {
    const wallet = await prisma.wallet.findUniqueOrThrow({ where: { id } });
    const isIncome = type === 'INCOME';

    return prisma.wallet.update({
      where: { id },
      data: {
        balance: isIncome ? wallet.balance + amount : wallet.balance - amount,
        income: isIncome ? wallet.income + amount : wallet.income,
        expense: !isIncome ? wallet.expense + amount : wallet.expense,
        incomeCount: isIncome ? wallet.incomeCount + 1 : wallet.incomeCount,
        expenseCount: !isIncome ? wallet.expenseCount + 1 : wallet.expenseCount,
      },
    });
  }

  async revertBalance(
    id: string,
    amount: number,
    type: 'INCOME' | 'EXPENSE'
  ): Promise<Wallet> {
    const wallet = await prisma.wallet.findUniqueOrThrow({ where: { id } });
    const isIncome = type === 'INCOME';

    return prisma.wallet.update({
      where: { id },
      data: {
        balance: isIncome ? wallet.balance - amount : wallet.balance + amount,
        income: isIncome ? wallet.income - amount : wallet.income,
        expense: !isIncome ? wallet.expense - amount : wallet.expense,
        incomeCount: isIncome ? wallet.incomeCount - 1 : wallet.incomeCount,
        expenseCount: !isIncome ? wallet.expenseCount - 1 : wallet.expenseCount,
      },
    });
  }
}