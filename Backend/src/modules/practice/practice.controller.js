import * as practiceService from './practice.service.js';
import { asyncHandler } from '../../shared/middleware/error.middleware.js';
import { sendSuccess, sendError } from '../../shared/utils/responseHandler.js';

export const importTest = asyncHandler(async (req, res) => {
  const test = await practiceService.importPracticeTest(req.user.id, req.body);
  return sendSuccess(res, 'Test imported successfully', { test }, 201);
});

export const getMyTests = asyncHandler(async (req, res) => {
  const tests = await practiceService.getUserTests(req.user.id);
  return sendSuccess(res, 'Tests fetched successfully', { tests });
});

export const getTestDetails = asyncHandler(async (req, res) => {
  const test = await practiceService.getTestById(req.params.id);
  if (!test) {
    return sendError(res, 'Test not found', 404);
  }
  return sendSuccess(res, 'Test details fetched successfully', { test });
});

export const submitResult = asyncHandler(async (req, res) => {
  const result = await practiceService.submitTestResult(req.user.id, req.params.id, req.body);
  return sendSuccess(res, 'Result submitted successfully', { result }, 201);
});
