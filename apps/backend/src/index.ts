import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth';
import { businessRouter } from './routes/business';
import { contactRouter } from './routes/contact';
import { invoiceRouter } from './routes/invoice';
import { transactionRouter } from './routes/transaction';
import { fileRouter } from './routes/file';
import { customerRouter } from './routes/customer';
import { accountRouter } from './routes/account';
import { aiRouter } from './routes/ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(path.resolve(uploadDir)));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/businesses', businessRouter);

// Nested business routes
app.use('/api/businesses/:businessId/contacts', contactRouter);
app.use('/api/businesses/:businessId/customers', customerRouter);
app.use('/api/businesses/:businessId/accounts', accountRouter);
app.use('/api/businesses/:businessId/invoices', invoiceRouter);
app.use('/api/businesses/:businessId/transactions', transactionRouter);
app.use('/api/businesses/:businessId/files', fileRouter);
app.use('/api/businesses/:businessId/ai', aiRouter);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
