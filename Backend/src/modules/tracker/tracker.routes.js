import { Router } from 'express';
import {
  createOrUpdateLog,
  getAllLogs,
  getLogByDate,
  deleteLog,
} from './tracker.controller.js';
import { trackerValidation } from './tracker.validation.js';
import { authenticate } from '../../shared/middleware/auth.middleware.js';

const router = Router();

// All tracker routes require authentication
router.use(authenticate);

router.post('/', trackerValidation, createOrUpdateLog);
router.get('/', getAllLogs);
router.get('/:date', getLogByDate);
router.delete('/:date', deleteLog);

export default router;
