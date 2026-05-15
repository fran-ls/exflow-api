import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils/apiResponse';
import { envs } from '../config/envs';

export class AuthController {
  private readonly authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // POST /auth/register
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      this.setTokenCookie(res, result.tokens.refreshToken);

      ApiResponse.created(res, {
        user: result.user,
        accessToken: result.tokens.accessToken
      }, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/login
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);
      this.setTokenCookie(res, result.tokens.refreshToken);

      // ApiResponse.success(res, result, 'Login successful');
      ApiResponse.success(res, {
        user: result.user,
        accessToken: result.tokens.accessToken,
      }, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/refresh
  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const refreshToken = req.cookies.refreshToken;

    try {
      const tokens = await this.authService.refresh(refreshToken);
      this.setTokenCookie(res, tokens.refreshToken);

      ApiResponse.success(res, { accessToken: tokens.accessToken }, 'Tokens refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/logout
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const refreshToken = req.cookies.refreshToken;

    try {
      await this.authService.logout(refreshToken);
      res.clearCookie('refreshToken');
      ApiResponse.success(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/logout-all
   * Revokes all sessions for the authenticated user
  */
  logoutAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.authService.logoutAll(req.user!.sub);
      ApiResponse.success(res, null, 'All sessions revoked');
    } catch (error) {
      next(error);
    }
  }

  // GET /auth/me
  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.authService.getProfile(req.user!.sub);
      ApiResponse.success(res, user, 'Profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  // PATCH /auth/change-password
  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      await this.authService.changePassword(req.user!.sub, currentPassword, newPassword);
      ApiResponse.success(res, null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/encrypt-password
  encryptPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hash = await this.authService.encryptPassword(req.body.password);
      ApiResponse.success(res, { hash }, 'Password encrypted successfully');
    } catch (error) {
      next(error);
    }
  }

  private setTokenCookie = (res: Response, value: string): void => {
    res.cookie('refreshToken', value, {
      httpOnly: true,
      secure: envs.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
