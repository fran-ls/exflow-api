import { Prisma, User } from '../generated/prisma/client';
import { prisma } from '../database/prisma';
import { BaseRepository } from './base.repository';
import {
  ICreateUser,
  IUserFilters,
} from '../interfaces/user.interface';

export class UserRepository extends BaseRepository<
  User,
  ICreateUser,
  Partial<ICreateUser>,
  IUserFilters
> {

  async findOne(filters: Prisma.UserWhereInput): Promise<User | null> {
    return prisma.user.findFirst({
      where: filters,
    });
  }

  async findWithFilters(filters: IUserFilters): Promise<{ data: User[]; total: number; }> {
    const {
      username,
      email,
      page = 1,
      limit = 10,
      orderBy = 'createdAt',
      order = 'desc',
    } = filters;

    const where: Prisma.UserWhereInput = {}

    if (username) where.username = username;
    if (email) where.email = email;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: order },
      }),
      prisma.user.count({ where }),
    ]);

    return { data, total }
  }

  async findAll(): Promise<User[]> {
    return []
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: ICreateUser): Promise<User> {
    return prisma.user.create({
      data: { ...data, photoURL: '' },
    });
  }

  async update(id: string, data: Partial<ICreateUser>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<User> {
    return prisma.user.delete({ where: { id } });
  }
}