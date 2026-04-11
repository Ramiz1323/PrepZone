import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export const connectDB = async (retries = MAX_RETRIES) => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      family: 4,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    if (retries > 0) {
      logger.warn(`Connection failed. Retrying... (${retries} left)`);
      await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
      return connectDB(retries - 1);
    }
    logger.error('MongoDB failed after all retries:', error.message);
    process.exit(1);
  }
};
