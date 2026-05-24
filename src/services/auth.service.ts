import { UserRepository } from '../repositories/user.repository';
import { User } from '../generated/prisma/client';
import {
  IRegisterDto,
  ILoginDto,
  IAuthResponse,
  IAuthTokens,
  IUserPublic,
} from '../interfaces/auth.interface';
import { HashUtil } from '../utils/hash';
import { JwtUtil } from '../utils/jwt';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from '../utils/appError';

export class AuthService {
  private readonly userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(dto: IRegisterDto): Promise<IAuthResponse> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) throw new ConflictError('Email already registered');

    const hashedPassword = await HashUtil.hash(dto.password);
    const user = await this.userRepository.create({ ...dto, password: hashedPassword });

    const tokens = await this.generateAndSaveTokens(user as IUserPublic);
    return { user: user as IUserPublic, tokens }
  }

  async login(dto: ILoginDto): Promise<IAuthResponse> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) throw new UnauthorizedError('Invalid credentials');
    if (!user.isActive) throw new ForbiddenError('Account is disabled');

    await this.logoutAll(user.id);

    const passwordMatch = await HashUtil.compare(dto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedError('Invalid credentials');

    const tokens = await this.generateAndSaveTokens(user);
    const { password: _, ...userPublic } = user;
    return { user: userPublic as IUserPublic, tokens }
  }

  async refresh(refreshToken: string): Promise<IAuthTokens> {
    if (!refreshToken) {
      throw new ValidationError('refreshToken is required');
    }

    let payload;

    try {
      payload = JwtUtil.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const stored = await this.userRepository.findRefreshToken(refreshToken);
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token revoked or expired');
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user || !user.isActive) throw new UnauthorizedError('User not found or inactive');

    // Rotate refresh token
    await this.userRepository.deleteRefreshToken(refreshToken);
    return await this.generateAndSaveTokens(user);
  }

  async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) {
      throw new ValidationError('refreshToken is required');
    }

    await this.userRepository.deleteRefreshToken(refreshToken);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.userRepository.deleteAllUserRefreshTokens(userId);
  }

  async logoutAllByEmail(email: string): Promise<void> {
    if (!email) {
      throw new ValidationError('email is required');
    }

    const user = await this.userRepository.findByEmail(email);

    if (user) {
      await this.logoutAll(user.id);
    }
  }

  async getProfile(userId: string): Promise<IUserPublic> {
    const user = await this.userRepository.findByIdPublic(userId);
    if (!user) throw new NotFoundError('User');
    return user as IUserPublic;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError('User');

    const match = await HashUtil.compare(currentPassword, user.password);
    if (!match) throw new UnauthorizedError('Current password is incorrect');

    const hashed = await HashUtil.hash(newPassword);
    await this.userRepository.updatePassword(userId, hashed);
    // Revoke all sessions after password change
    await this.userRepository.deleteAllUserRefreshTokens(userId);
  }

  private async generateAndSaveTokens(user: Pick<User, 'id' | 'email' | 'role'>): Promise<IAuthTokens> {
    const payload = { sub: user.id, email: user.email, role: user.role }
    const accessToken = JwtUtil.signAccessToken(payload);
    const refreshToken = JwtUtil.signRefreshToken(payload);
    const expiresAt = JwtUtil.getRefreshExpiresAt();

    await this.userRepository.saveRefreshToken(user.id, refreshToken, expiresAt);
    return { accessToken, refreshToken }
  }

  async encryptPassword(password: string): Promise<string> {
    return await HashUtil.hash(password);
  }
}
