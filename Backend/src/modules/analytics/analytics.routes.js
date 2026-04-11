import { Router } from 'express';
import { getSummary, getWeekly, getSuggestions, getCalendar } from './analytics.controller.js';
import { authenticate } from '../../shared/middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/summary', getSummary);
router.get('/weekly', getWeekly);       // ?days=7
router.get('/suggestions', getSuggestions);
router.get('/calendar', getCalendar);   // ?year=2025

export default router;
