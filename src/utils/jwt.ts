import jwt, { SignOptions } from 'jsonwebtoken';
import { ITokenPayload } from '../interfaces/auth.interface';
import { envs } from '../config/envs';

const JWT_CONFIG = envs.JWT_CONFIG;
const ACCESS_SECRET = JWT_CONFIG.ACCESS_SECRET || 'fallback_access_secret_change_me';
const REFRESH_SECRET = JWT_CONFIG.REFRESH_SECRET || 'fallback_refresh_secret_change_me';
const ACCESS_EXPIRES = JWT_CONFIG.ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = JWT_CONFIG.REFRESH_EXPIRES_IN || '7d';

export class JwtUtil {
  static signAccessToken(payload: Omit<ITokenPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, ACCESS_SECRET, {
      expiresIn: ACCESS_EXPIRES,
    } as SignOptions);
  }

  static signRefreshToken(payload: Omit<ITokenPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, REFRESH_SECRET, {
      expiresIn: REFRESH_EXPIRES,
    } as SignOptions);
  }

  static verifyAccessToken(token: string): ITokenPayload {
    return jwt.verify(token, ACCESS_SECRET) as ITokenPayload;
  }

  static verifyRefreshToken(token: string): ITokenPayload {
    return jwt.verify(token, REFRESH_SECRET) as ITokenPayload;
  }

  static decodeToken(token: string): ITokenPayload | null {
    return jwt.decode(token) as ITokenPayload | null;
  }

  static getRefreshExpiresAt(): Date {
    const days = parseInt(REFRESH_EXPIRES.replace('d', ''), 10) || 7;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }
}