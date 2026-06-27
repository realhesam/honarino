import axios, { AxiosError } from 'axios';
import { ApiError } from './ApiError';
import { AppError } from './AppError';

export function mapToAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    const serverMessage =
      responseData?.message || 
      responseData?.error || 
      (typeof responseData === 'string' ? responseData : null) || 
      'خطای ارتباط با سرور';

    return new ApiError(
      serverMessage,
      error.response?.status,
      error
    );
  }

  return new AppError({
    message: error instanceof Error ? error.message : 'خطای ناشناخته‌ای رخ داد',
    code: 'UNKNOWN_ERROR',
    originalError: error,
  });
}