import { Router } from 'express';
import { getColleges } from './college.controller.js';

const router = Router();

// Public route to get all colleges
router.get('/', getColleges);

export default router;
