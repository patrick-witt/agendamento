class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Para diferenciar erros operacionais de bugs no código
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
