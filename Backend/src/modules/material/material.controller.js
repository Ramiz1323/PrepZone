import { asyncHandler } from '../../shared/middleware/error.middleware.js';
import { sendSuccess, sendError } from '../../shared/utils/responseHandler.js';
import * as materialService from './material.service.js';

export const uploadMaterialItem = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, 'Please select a PDF file to upload', 400);
  }

  const { title, subject, description } = req.body;

  if (!title || !title.trim()) {
    return sendError(res, 'Document title is required', 400);
  }

  // Parse tags if provided
  let tags = [];
  if (req.body.tags) {
    if (Array.isArray(req.body.tags)) {
      tags = req.body.tags;
    } else if (typeof req.body.tags === 'string') {
      try {
        tags = JSON.parse(req.body.tags);
      } catch {
        tags = req.body.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }
  }

  const material = await materialService.uploadMaterial({
    userId: req.user.id,
    title: title.trim(),
    subject: subject || 'Others',
    description: (description || '').trim(),
    tags,
    fileBuffer: req.file.buffer,
    originalName: req.file.originalname,
    fileSize: req.file.size,
  });

  return sendSuccess(res, 'Study material uploaded successfully', material, 201);
});

export const getMaterialItems = asyncHandler(async (req, res) => {
  const { search, subject, page, limit } = req.query;
  const result = await materialService.getUserMaterials(req.user.id, {
    search,
    subject,
    page,
    limit,
  });
  return sendSuccess(res, 'Materials retrieved successfully', result);
});

export const getMaterialItem = asyncHandler(async (req, res) => {
  const material = await materialService.getMaterialById(req.user.id, req.params.id);
  return sendSuccess(res, 'Material retrieved successfully', material);
});

export const deleteMaterialItem = asyncHandler(async (req, res) => {
  await materialService.deleteMaterial(req.user.id, req.params.id);
  return sendSuccess(res, 'Study material deleted successfully');
});
