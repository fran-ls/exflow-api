import { Wallet, Prisma } from '../generated/prisma/client';
import { prisma } from '../database/prisma';
import { BaseRepository } from './base.repository';
import {
  ICreateWallet,
  IUpdateWallet,
  IWalletFilters,
  IWalletSelect,
  WallletStat,
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

  async count(filters: Partial<IWalletSelect>): Promise<number> {
    const data: any = await this.aggregate({
      where: filters,
      _count: {
        _all: true,
      }
    });

    return data._count?._all ?? 0;
  }

  private async aggregate(payload: Prisma.WalletAggregateArgs) {
    return prisma.wallet.aggregate(payload);
  }

  async findUnique(filters: Prisma.WalletFindUniqueOrThrowArgs): Promise<Wallet | null> {
    return prisma.wallet.findUnique(filters);
  }

  async findAll(): Promise<Wallet[]> {
    return prisma.wallet.findMany({
      orderBy: { createdAt: 'desc' },
      include: { transactions: false },
    });
  }

  async findWithFilters(filters: IWalletFilters): Promise<{ data: Wallet[]; total: number }> {
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

  async getTotalBalance(userId: string): Promise<number> {
    const { _sum } = await this.aggregate({
      where: { userId },
      _sum: {
        balance: true
      }
    });

    return _sum?.balance ?? 0;
  }

  async getWalletStats(filters: Prisma.WalletWhereInput): Promise<WallletStat> {
    const where: Prisma.WalletWhereInput = {}

    if (filters.id) where.id = filters.id;
    if (filters.userId) where.userId = filters.userId;

    const { _sum } = await this.aggregate({
      where,
      _sum: {
        balance: true,
        income: true,
        expense: true,
        incomeCount: true,
        expenseCount: true
      }
    });

    return {
      balance: _sum?.balance ?? 0,
      income: _sum?.income ?? 0,
      expense: _sum?.expense ?? 0,
      incomeCount: _sum?.incomeCount ?? 0,
      expenseCount: _sum?.expenseCount ?? 0,
    }
  }
}