import { Router } from 'express';
import { register, login, getMe, logout, updateGoal } from './auth.controller.js';
import { registerValidation, loginValidation } from './auth.validation.js';
import { authenticate } from '../../shared/middleware/auth.middleware.js';
import { authLimiter } from '../../shared/middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.patch('/goal', authenticate, updateGoal);

export default router;
