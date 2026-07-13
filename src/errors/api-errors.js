// Typed errors carry their own HTTP status. Thrown anywhere downstream of a
// route (service, repository, strategy) and mapped to a response in one
// place: src/middleware/error-handler.js.
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export class ValidationError extends ApiError {
  constructor(message) {
    super(400, message);
  }
}

export class NotFoundError extends ApiError {
  constructor(message) {
    super(404, message);
  }
}

export class ConflictError extends ApiError {
  constructor(message) {
    super(409, message);
  }
}
