import { Request, Response, NextFunction } from 'express';
import { Role } from '../generated/prisma/enums';
import { UserService } from '../services/user.service';
import { ApiResponse } from '../utils/apiResponse';

export class UserController {
  private readonly userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // GET /users  [ADMIN]
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.userService.getAll();
      ApiResponse.success(res, users, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // GET /users/:id  [ADMIN or self]
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.getById(req.params.id);
      ApiResponse.success(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // PATCH /users/:id  [ADMIN or self]
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.update(req.params.id, req.body, req.user!);
      ApiResponse.success(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // PATCH /users/:id/status  [ADMIN]
  setActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { isActive } = req.body;
      const user = await this.userService.setActive(req.params.id, isActive);
      ApiResponse.success(res, user, `User ${isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      next(error);
    }
  }

  // PATCH /users/:id/role  [ADMIN]
  setRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.setRole(req.params.id, req.body.role as Role);
      ApiResponse.success(res, user, 'User role updated');
    } catch (error) {
      next(error);
    }
  }

  // DELETE /users/:id  [ADMIN or self]
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.userService.delete(req.params.id, req.user!);
      ApiResponse.success(res, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}