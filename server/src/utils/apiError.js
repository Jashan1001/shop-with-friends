class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Marks this as an expected error, not a bug
  }
}

module.exports = ApiError;