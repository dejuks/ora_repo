export class AppError extends Error {
  constructor(message, statusCode = 400, details = null) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const badRequest = (message, details = null) => new AppError(message, 400, details);
export const unauthorized = (message = "Unauthorized") => new AppError(message, 401);
export const forbidden = (message = "Forbidden") => new AppError(message, 403);
export const notFound = (message = "Not found") => new AppError(message, 404);
