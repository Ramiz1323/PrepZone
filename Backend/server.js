import { connectDB } from './src/shared/config/db.js';
import { env } from './src/shared/config/env.js';
import { logger } from './src/shared/utils/logger.js';
import app from './src/app.js';

const startServer = async () => {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    logger.info(`PrepZone running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  const shutdown = (signal) => {
    logger.warn(`${signal} received. Shutting down...`);
    server.close(() => {
      logger.info('Server closed.');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
    shutdown('unhandledRejection');
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    shutdown('uncaughtException');
  });
};

startServer();
