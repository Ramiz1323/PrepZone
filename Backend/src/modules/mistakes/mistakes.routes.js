import { Router } from 'express';
import {
  addMistake,
  getMistakes,
  updateMistake,
  deleteMistake,
  getMistakeAnalytics,
} from './mistakes.controller.js';
import { mistakeValidation } from './mistakes.validation.js';
import { authenticate } from '../../shared/middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', mistakeValidation, addMistake);
router.get('/', getMistakes);                        // ?subject=OS&page=1&limit=20
router.get('/analytics', getMistakeAnalytics);
router.patch('/:id', updateMistake);
router.delete('/:id', deleteMistake);

export default router;
