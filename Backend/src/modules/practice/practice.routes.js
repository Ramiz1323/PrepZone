import express from 'express';
import * as practiceController from './practice.controller.js';
import { authenticate } from '../../shared/middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate); // All practice routes require authentication

router.post('/import', practiceController.importTest);
router.get('/my-tests', practiceController.getMyTests);
router.get('/:id', practiceController.getTestDetails);
router.post('/:id/submit', practiceController.submitResult);

export default router;
