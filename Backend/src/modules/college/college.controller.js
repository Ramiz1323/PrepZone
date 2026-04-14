import { asyncHandler } from '../../shared/middleware/error.middleware.js';
import { sendSuccess } from '../../shared/utils/responseHandler.js';
import * as collegeService from './college.service.js';

/**
 * Controller to get all colleges
 */
export const getColleges = asyncHandler(async (req, res) => {
  const colleges = await collegeService.getAllColleges();
  return sendSuccess(res, 'Colleges fetched successfully', colleges);
});
