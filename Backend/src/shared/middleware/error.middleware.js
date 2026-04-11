import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

// eslint-disable-next-line no-unused-vars
export const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (env.NODE_ENV !== 'production') {
    logger.error(err.stack);
  } else {
    logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method}`);
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid resource ID format.' });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`,
    });
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: 'Validation failed.', errors });
  }

  return res.status(statusCode).json({ success: false, message });
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
