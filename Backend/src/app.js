import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './shared/config/env.js';
import { globalErrorHandler } from './shared/middleware/error.middleware.js';
import { apiLimiter } from './shared/middleware/rateLimiter.js';
import { logger } from './shared/utils/logger.js';

import authRoutes from './modules/auth/auth.routes.js';
import trackerRoutes from './modules/tracker/tracker.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import mistakesRoutes from './modules/mistakes/mistakes.routes.js';
import revisionRoutes from './modules/revision/revision.routes.js';

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'];
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
  }));
}

app.use('/api', apiLimiter);

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'PrepZone API is running',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/tracker', trackerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/mistakes', mistakesRoutes);
app.use('/api/revision', revisionRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use(globalErrorHandler);

export default app;
