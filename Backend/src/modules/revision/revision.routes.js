import { Router } from 'express';
import {
  addRevisionItem,
  getRevisionItems,
  updateRevisionItem,
  deleteRevisionItem,
  getRevisionStats,
} from './revision.controller.js';
import { authenticate } from '../../shared/middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', addRevisionItem);
router.get('/', getRevisionItems);          // ?status=pending&subject=OS&priority=high
router.get('/stats', getRevisionStats);
router.patch('/:id', updateRevisionItem);
router.delete('/:id', deleteRevisionItem);

export default router;
