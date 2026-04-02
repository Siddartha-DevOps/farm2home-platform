// backend/middleware/errorHandler.js

// Central error handler — add as the LAST middleware in app.js:
//   app.use(errorHandler);

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url} —`, err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: 'Validation failed', errors: messages });
  }

  // Mongoose duplicate key (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ success: false, message: `${field} already exists.` });
  }

  // JWT error (if not caught in middleware)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }

  // Custom app errors: throw new AppError('message', 404)
  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }

  // Fallback — don't leak stack trace in production
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error.' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

// Usage: throw new AppError('Product not found', 404)
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { errorHandler, AppError };
