import { Role } from "../generated/prisma/enums";

export interface IUser {
  id: string;
  email: string;
  password: string;
  username: string;
  photoURL: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPublic {
  id: string;
  email: string;
  username: string;
  photoURL?: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
}

export interface IRegisterDto {
  email: string;
  password: string;
  username: string;
  photoURL?: string;
  role?: Role;
}

export interface ILoginDto {
  email: string;
  password: string;
}

export interface ITokenPayload {
  sub: string;       // userId
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthResponse {
  user: IUserPublic;
  tokens: IAuthTokens;
}

// Extends Express Request to carry authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: ITokenPayload;
    }
  }
}
