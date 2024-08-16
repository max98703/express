const STATUS_CODES = {
  OK: 200,
  BAD_REQUEST: 400,
  UN_AUTHORISED: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

class AppError extends Error {
  constructor(name, statusCode, description, isOperational = true, errorStack = '', logError = false) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorStack = errorStack || this.stack; // Use provided stack or default to this.stack
    this.logError = logError;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// API-specific errors
class APIError extends AppError {
  constructor(name, statusCode = STATUS_CODES.INTERNAL_ERROR, description = "Internal Server Error", isOperational = true) {
    super(name, statusCode, description, isOperational);
  }
}

// 400 Bad Request
class BadRequestError extends AppError {
  constructor(description = "Bad request", logError = false) {
    super("BAD REQUEST", STATUS_CODES.BAD_REQUEST, description, true, '', logError);
  }
}

// 400 Validation Error
class ValidationError extends AppError {
  constructor(description = "Validation Error", errorStack = '') {
    super("VALIDATION ERROR", STATUS_CODES.BAD_REQUEST, description, true, errorStack);
  }
}

module.exports = {
  AppError,
  APIError,
  BadRequestError,
  ValidationError,
  STATUS_CODES,
};
