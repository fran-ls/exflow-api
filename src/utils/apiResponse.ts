import { Response } from 'express';
import { IApiResponse, IPaginationMeta } from '../interfaces/common.interface';

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200,
    meta?: IPaginationMeta
  ): Response {
    const response: IApiResponse<T> = {
      success: true,
      message,
      data,
      ...(meta && { meta }),
    }
    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message = 'Resource created'): Response {
    return ApiResponse.success(res, data, message, 201);
  }

  static error(
    res: Response,
    message: string,
    statusCode = 500,
    error?: string
  ): Response {
    const response: IApiResponse = {
      success: false,
      message,
      ...(error && { error }),
    }
    return res.status(statusCode).json(response);
  }

  static notFound(res: Response, message = 'Resource not found'): Response {
    return ApiResponse.error(res, message, 404);
  }

  static badRequest(res: Response, message: string, error?: string): Response {
    return ApiResponse.error(res, message, 400, error);
  }

  static buildPaginationMeta(
    total: number,
    page: number,
    limit: number
  ): IPaginationMeta {
    const totalPages = Math.ceil(total / limit);
    return {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    }
  }
}