import { Role, User } from '../generated/prisma/client';
import { UserRepository } from '../repositories/user.repository';
import { NotFoundError, ForbiddenError } from '../utils/appError';
import { ITokenPayload } from '../interfaces/auth.interface';

export class UserService {
  private readonly userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async findOne(filters: Partial<User>): Promise<User> {
    const stat = await this.userRepository.findOne(filters);
    if (!stat) throw new NotFoundError('User');
    return stat;
  }

  async getAll(): Promise<Omit<User, 'password'>[]> {
    return this.userRepository.findAll();
  }

  async getById(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findByIdPublic(id);
    if (!user) throw new NotFoundError('User');
    return user;
  }

  async update(
    targetId: string,
    data: Partial<Pick<User, 'username' | 'email'>>,
    requester: ITokenPayload
  ): Promise<Omit<User, 'password'>> {
    // Users can only update themselves; admins can update anyone
    if (requester.role !== Role.ADMIN && requester.sub !== targetId) {
      throw new ForbiddenError('You can only update your own profile');
    }
    await this.getById(targetId);
    return this.userRepository.update(targetId, data);
  }

  async setActive(
    targetId: string,
    isActive: boolean
  ): Promise<Omit<User, 'password'>> {
    await this.getById(targetId);
    return this.userRepository.update(targetId, { isActive });
  }

  async setRole(
    targetId: string,
    role: Role
  ): Promise<Omit<User, 'password'>> {
    await this.getById(targetId);
    return this.userRepository.update(targetId, { role });
  }

  async delete(targetId: string, requester: ITokenPayload): Promise<void> {
    if (requester.role !== Role.ADMIN && requester.sub !== targetId) {
      throw new ForbiddenError('You can only delete your own account');
    }
    await this.getById(targetId);
    await this.userRepository.delete(targetId);
  }
}