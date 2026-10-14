import multer from 'multer';
import { sendError } from '../utils/responseHandler.js';

// Memory storage keeps file buffers in memory for direct cloud streaming
const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = file.originalname.toLowerCase().endsWith('.pdf');

  if (isPdfMime || isPdfExt) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file format. Only PDF files (.pdf) are supported.');
    error.statusCode = 400;
    cb(error, false);
  }
};

const multerUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max limit
  },
});

/**
 * Express middleware wrapper around multer.
 * Safely traps MulterError and file-validation errors to return 400 status codes.
 */
export const uploadPdf = (req, res, next) => {
  multerUpload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return sendError(res, 'File size exceeds maximum allowed limit of 25MB.', 400);
      }
      return sendError(res, `Upload error: ${err.message}`, 400);
    }
    if (err) {
      return sendError(res, err.message || 'File upload failed.', err.statusCode || 400);
    }
    next();
  });
};
