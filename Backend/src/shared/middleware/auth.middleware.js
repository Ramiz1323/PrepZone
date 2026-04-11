import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { sendError } from '../utils/responseHandler.js';

export const authenticate = (req, res, next) => {
  const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

  if (!token) {
    return sendError(res, 'Access denied. No token provided.', 401);
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Token expired. Please login again.', 401);
    }
    return sendError(res, 'Invalid token.', 401);
  }
};
