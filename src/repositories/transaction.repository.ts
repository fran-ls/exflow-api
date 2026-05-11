import { Transaction, Prisma } from '../generated/prisma/client';
import { prisma } from '../database/prisma';
import { BaseRepository } from './base.repository';
import {
  ICreateTransaction,
  IUpdateTransaction,
  ITransactionFilters,
} from '../interfaces/transaction.interface';

export class TransactionRepository extends BaseRepository<
  Transaction,
  ICreateTransaction,
  IUpdateTransaction,
  ITransactionFilters
> {
  async findAll(): Promise<Transaction[]> {
    return prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        wallet: {
          select: { id: true, name: true, color: true, type: true }
        }
      }
    });
  }

  async findWithFilters(
    filters: ITransactionFilters
  ): Promise<{ data: Transaction[]; total: number }> {
    const {
      userId,
      walletId,
      type,
      title,
      date,
      dateFrom,
      dateTo,
      minAmount,
      maxAmount,
      page = 1,
      limit = 10,
      orderBy = 'createdAt',
      order = 'desc',
    } = filters;

    const where: Prisma.TransactionWhereInput = {}

    if (userId) where.userId = userId;
    if (walletId) where.walletId = walletId;
    if (type) where.type = type;
    if (title) where.title = { contains: title, mode: 'insensitive' }
    if (date) {
      const [year, month, day] = date.split('-').map(Number);

      where.AND = {
        year,
        month,
        day,
      }
    }
    if (dateFrom || dateTo) {
      where.date = {}
      if (dateFrom) (where.date as Prisma.StringFilter).gte = dateFrom;
      if (dateTo) (where.date as Prisma.StringFilter).lte = dateTo;
    }
    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {}
      if (minAmount !== undefined) where.amount.gte = minAmount;
      if (maxAmount !== undefined) where.amount.lte = maxAmount;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: order },
        include: {
          wallet: {
            select: { id: true, name: true, color: true, type: true }
          }
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return { data, total }
  }

  async findById(id: string): Promise<Transaction | null> {
    return prisma.transaction.findUnique({
      where: { id },
      include: {
        wallet: {
          select: { id: true, name: true, color: true, type: true }
        }
      },
    });
  }

  async findByWalletId(walletId: string): Promise<Transaction[]> {
    return prisma.transaction.findMany({
      where: { walletId },
      orderBy: { date: 'desc' },
    });
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    return prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  async create(data: ICreateTransaction): Promise<Transaction> {
    return prisma.transaction.create({
      data,
      include: {
        wallet: {
          select: { id: true, name: true, color: true, type: true }
        },
      },
    });
  }

  async update(id: string, data: IUpdateTransaction): Promise<Transaction> {
    return prisma.transaction.update({
      where: { id },
      data,
      include: {
        wallet: {
          select: { id: true, name: true, color: true, type: true }
        }
      },
    });
  }

  async delete(id: string): Promise<Transaction> {
    return prisma.transaction.delete({ where: { id } });
  }

  async getSummaryByWallet(walletId: string) {
    return prisma.transaction.groupBy({
      by: ['type'],
      where: { walletId },
      _sum: { amount: true },
      _count: { id: true },
    });
  }
}