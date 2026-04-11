import { asyncHandler } from '../../shared/middleware/error.middleware.js';
import { sendSuccess, sendError } from '../../shared/utils/responseHandler.js';
import * as revisionService from './revision.service.js';

export const addRevisionItem = asyncHandler(async (req, res) => {
  const item = await revisionService.addRevisionItem(req.user.id, req.body);
  return sendSuccess(res, 'Revision item added', item, 201);
});

export const getRevisionItems = asyncHandler(async (req, res) => {
  const { status, subject, priority } = req.query;
  const items = await revisionService.getRevisionItems(req.user.id, { status, subject, priority });
  return sendSuccess(res, 'Revision items fetched', { count: items.length, items });
});

export const updateRevisionItem = asyncHandler(async (req, res) => {
  const updated = await revisionService.updateRevisionItem(req.user.id, req.params.id, req.body);
  if (!updated) return sendError(res, 'Revision item not found', 404);
  return sendSuccess(res, 'Revision item updated', updated);
});

export const deleteRevisionItem = asyncHandler(async (req, res) => {
  const deleted = await revisionService.deleteRevisionItem(req.user.id, req.params.id);
  if (!deleted) return sendError(res, 'Revision item not found', 404);
  return sendSuccess(res, 'Revision item deleted');
});

export const getRevisionStats = asyncHandler(async (req, res) => {
  const stats = await revisionService.getRevisionStats(req.user.id);
  return sendSuccess(res, 'Revision stats fetched', stats);
});
