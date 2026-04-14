import { validationResult } from 'express-validator';
import { asyncHandler } from '../../shared/middleware/error.middleware.js';
import { sendSuccess, sendError } from '../../shared/utils/responseHandler.js';
import * as authService from './auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', 422, errors.array());
  }

  const result = await authService.registerUser(req.body);
  
  res.cookie('token', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days (matching JWT expiration preference)
  });

  return sendSuccess(res, 'Account created successfully', { user: result.user }, 201);
});

export const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', 422, errors.array());
  }

  const result = await authService.loginUser(req.body);

  res.cookie('token', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return sendSuccess(res, 'Login successful', { user: result.user });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  return sendSuccess(res, 'Logged out successfully');
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  return sendSuccess(res, 'User fetched successfully', user);
});

export const updateGoal = asyncHandler(async (req, res) => {
  const { dailyMCQGoal } = req.body;
  if (!dailyMCQGoal || dailyMCQGoal < 1) {
    return sendError(res, 'Invalid goal. Must be at least 1.', 400);
  }

  const user = await authService.updateDailyGoal(req.user.id, dailyMCQGoal);
  return sendSuccess(res, 'Daily goal updated successfully', user);
});

export const updateTargets = asyncHandler(async (req, res) => {
  const { targetColleges } = req.body;
  
  // Validation: Ensure it's an array of strings
  if (!Array.isArray(targetColleges)) {
    return sendError(res, 'Invalid format. targetColleges must be an array.', 400);
  }

  const user = await authService.updateTargetColleges(req.user.id, targetColleges);
  return sendSuccess(res, 'Target colleges updated successfully', user);
});
