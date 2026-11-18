import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config } from './config/env';
import { connectDB } from './config/db';
import { initSocketServer } from './sockets/socketHandler';
import { errorHandler } from './middleware/errorMiddleware';
import { seedDatabaseIfEmpty } from './utils/seedData';
import { logger } from './utils/logger';

// Routes
import authRoutes from './routes/authRoutes';
import complaintRoutes from './routes/complaintRoutes';
import aiRoutes from './routes/aiRoutes';
import officerRoutes from './routes/officerRoutes';
import adminRoutes from './routes/adminRoutes';
import notificationRoutes from './routes/notificationRoutes';
import publicRoutes from './routes/publicRoutes';

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocketServer(server, config.clientUrl);

// Security and middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

app.use(
  cors({
    origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
);

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(morgan('dev'));

// Static serve for uploads
const uploadsPath = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// API Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});
app.use('/api', apiLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    platform: 'CivicFix AI',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/officer', officerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/public', publicRoutes);

// 404 Catch-all
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on CivicFix AI Server.`
  });
});

// Central Error Handler
app.use(errorHandler);

// Server startup
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabaseIfEmpty();

    server.listen(config.port, () => {
      logger.info(`=======================================================`);
      logger.info(`🚀 CivicFix AI Server running on http://localhost:${config.port}`);
      logger.info(`🌐 Connected Client URL: ${config.clientUrl}`);
      logger.info(`🤖 Gemini Model: ${config.geminiModel}`);
      logger.info(`⚡ Socket.IO Real-time Engine initialized.`);
      logger.info(`=======================================================`);
    });
  } catch (error: any) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { app, server };
