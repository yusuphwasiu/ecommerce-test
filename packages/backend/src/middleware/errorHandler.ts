import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  console.error(`Error (${statusCode}): ${message}`);

  res.status(statusCode).json({
    error: message,
    statusCode,
  });
};

export const notFoundHandler = (_req: Request, res: Response, _next: NextFunction): void => {
  res.status(404).json({ error: 'Route not found' });
};
