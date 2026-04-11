import { validationResult } from 'express-validator';
import { asyncHandler } from '../../shared/middleware/error.middleware.js';
import { sendSuccess, sendError } from '../../shared/utils/responseHandler.js';
import * as trackerService from './tracker.service.js';

export const createOrUpdateLog = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, 'Validation failed', 422, errors.array());

  const entry = await trackerService.upsertTrackerEntry(req.user.id, req.body);
  return sendSuccess(res, 'Tracker entry saved successfully', entry, 201);
});

export const getAllLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 30;
  const skip = (page - 1) * limit;

  const logs = await trackerService.getUserLogs(req.user.id, limit, skip);
  return sendSuccess(res, 'Logs fetched successfully', { page, limit, count: logs.length, logs });
});

export const getLogByDate = asyncHandler(async (req, res) => {
  const { date } = req.params;
  const log = await trackerService.getLogByDate(req.user.id, date);
  if (!log) return sendError(res, `No log found for date: ${date}`, 404);
  return sendSuccess(res, 'Log fetched successfully', log);
});

export const deleteLog = asyncHandler(async (req, res) => {
  const { date } = req.params;
  const deleted = await trackerService.deleteLog(req.user.id, date);
  if (!deleted) return sendError(res, `No log found for date: ${date}`, 404);
  return sendSuccess(res, 'Log deleted successfully');
});
