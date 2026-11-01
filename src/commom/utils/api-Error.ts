type status = number;
type msg = string;
type isOperation = boolean;

export class ApiError extends Error {
  public statusCode: number;
  public isOperational: isOperation;
  constructor(statusCode: status, message: msg) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = false;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg: msg = "Bad request") {
    return new ApiError(400, msg);
  }

  static unauthorized(msg: msg = "Unauthorized") {
    return new ApiError(401, msg);
  }

  static conflict(msg: msg = "Conflict") {
    return new ApiError(409, msg);
  }

  static forbidden(msg: msg = "forbidden") {
    return new ApiError(412, msg);
  }

  static notfound(message: msg = "notfound") {
    return new ApiError(412, message);
  }
}
