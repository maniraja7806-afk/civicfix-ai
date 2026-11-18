import mongoose from 'mongoose';
import { config } from './env';
import { logger } from '../utils/logger';
import { getInMemoryStore } from '../utils/inMemoryStore';

export const connectDB = async (): Promise<boolean> => {
  try {
    logger.info(`Attempting MongoDB connection to ${config.mongodbUri}...`);
    // Connect with a 3-second serverSelectionTimeoutMS so offline local mongo won't hang startup
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000
    });
    logger.info('Connected to MongoDB database successfully.');
    getInMemoryStore().isConnectedToMongo = true;
    return true;
  } catch (error: any) {
    logger.warn(`MongoDB connection failed (${error.message}).`);
    logger.info('Starting CivicFix AI in Zero-Config In-Memory Mode with complete seed data.');
    getInMemoryStore().isConnectedToMongo = false;
    return false;
  }
};
