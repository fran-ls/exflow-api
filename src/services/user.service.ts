import { Wallet } from '../generated/prisma/client';
import { ICreateUser, IUser } from '../interfaces/user.interface';
import { UserRepository } from '../repositories/user.repository';
import { NotFoundError } from '../utils/appError';
import { ApiResponse } from '../utils/apiResponse';

export class UserService {
  private readonly userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getAll(): Promise<IUser[]> {
    return this.userRepository.findAll();
  }

  async getById(id: string): Promise<IUser> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundError('User');
    return user;
  }

  async create(data: ICreateUser): Promise<IUser> {
    return this.userRepository.create(data);
  }

  async update(id: string, data: Partial<ICreateUser>): Promise<IUser> {
    await this.getById(id);
    return this.userRepository.update(id, data);
  }

  async delete(id: string): Promise<IUser> {
    await this.getById(id);
    return this.userRepository.delete(id);
  }
}