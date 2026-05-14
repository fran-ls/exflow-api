import { prisma } from '../database/prisma';
import { Prisma, RefreshToken, User } from '../generated/prisma/client';
import { IRegisterDto } from '../interfaces/auth.interface';

export class UserRepository {
  async findOne(filters: Prisma.UserWhereInput): Promise<User | null> {
    return prisma.user.findFirst({
      where: filters,
    });
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    return prisma.user.findMany({
      omit: { password: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByIdPublic(id: string): Promise<Omit<User, 'password'> | null> {
    return prisma.user.findUnique({
      where: { id },
      omit: { password: true },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: IRegisterDto & { password: string }): Promise<Omit<User, 'password'>> {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        username: data.username,
        photoURL: data.photoURL,
        role: data.role
      },
      omit: { password: true },
    });
  }

  async update(id: string, data: Partial<Pick<User, 'username' | 'email' | 'isActive' | 'role'>>): Promise<Omit<User, 'password'>> {
    return prisma.user.update({
      where: { id },
      data,
      omit: { password: true },
    });
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }

  // --- Refresh Token methods ---
  async saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data: { token, userId, expiresAt },
    });
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({ where: { token } });
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }

  async deleteAllUserRefreshTokens(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async cleanExpiredTokens(): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}