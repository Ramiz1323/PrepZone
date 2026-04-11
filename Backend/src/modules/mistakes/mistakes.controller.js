import { validationResult } from 'express-validator';
import { asyncHandler } from '../../shared/middleware/error.middleware.js';
import { sendSuccess, sendError } from '../../shared/utils/responseHandler.js';
import * as mistakesService from './mistakes.service.js';

export const addMistake = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, 'Validation failed', 422, errors.array());

  const mistake = await mistakesService.addMistake(req.user.id, req.body);
  return sendSuccess(res, 'Mistake added successfully', mistake, 201);
});

export const getMistakes = asyncHandler(async (req, res) => {
  const { subject, page, limit } = req.query;
  const result = await mistakesService.getMistakes(req.user.id, {
    subject,
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20,
  });
  return sendSuccess(res, 'Mistakes fetched successfully', result);
});

export const updateMistake = asyncHandler(async (req, res) => {
  const updated = await mistakesService.updateMistake(req.user.id, req.params.id, req.body);
  if (!updated) return sendError(res, 'Mistake not found', 404);
  return sendSuccess(res, 'Mistake updated successfully', updated);
});

export const deleteMistake = asyncHandler(async (req, res) => {
  const deleted = await mistakesService.deleteMistake(req.user.id, req.params.id);
  if (!deleted) return sendError(res, 'Mistake not found', 404);
  return sendSuccess(res, 'Mistake deleted successfully');
});

export const getMistakeAnalytics = asyncHandler(async (req, res) => {
  const data = await mistakesService.getMistakeAnalytics(req.user.id);
  return sendSuccess(res, 'Mistake analytics fetched', data);
});
