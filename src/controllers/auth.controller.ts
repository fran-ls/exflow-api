import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils/apiResponse';

export class AuthController {
  private readonly authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // POST /auth/register
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      ApiResponse.created(res, result, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/login
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);
      ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/refresh
  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const tokens = await this.authService.refresh(refreshToken);
      ApiResponse.success(res, tokens, 'Tokens refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/logout
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      await this.authService.logout(refreshToken);
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
}
