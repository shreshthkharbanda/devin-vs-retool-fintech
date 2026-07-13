import { ValidationError } from '../errors/api-errors.js';

// Shared guard used by every repository that takes an id off the wire, so
// a malformed id fails fast with a 400 instead of reaching Postgres and
// coming back as a raw driver error.
export function assertPositiveInteger(value, fieldName) {
  if (!/^\d+$/.test(String(value))) {
    throw new ValidationError(`${fieldName} must be a positive integer`);
  }
}
