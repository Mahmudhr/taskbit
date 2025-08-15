export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public data?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleServerError(error: unknown) {
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.code,
      message: error.message,
      data: error.data,
    };
  }

  // Log the full error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Server Error:', error);
  }

  return {
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  };
}
