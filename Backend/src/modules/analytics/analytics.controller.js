import { asyncHandler } from '../../shared/middleware/error.middleware.js';
import { sendSuccess } from '../../shared/utils/responseHandler.js';
import * as analyticsService from './analytics.service.js';

export const getSummary = asyncHandler(async (req, res) => {
  const data = await analyticsService.getSummary(req.user.id);
  return sendSuccess(res, 'Analytics summary fetched', data);
});

export const getWeekly = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days, 10) || 7;
  const data = await analyticsService.getWeeklySummary(req.user.id, Math.min(Math.max(days, 1), 90));
  return sendSuccess(res, 'Weekly summary fetched', data);
});

export const getSuggestions = asyncHandler(async (req, res) => {
  const data = await analyticsService.getSuggestions(req.user.id);
  return sendSuccess(res, 'Suggestions generated', data);
});

export const getCalendar = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year, 10) || new Date().getFullYear();
  const data = await analyticsService.getCalendarData(req.user.id, year);
  return sendSuccess(res, 'Calendar data fetched', data);
});
