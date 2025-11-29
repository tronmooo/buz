import { Router } from 'express';
import {
  getBusinessSummary,
  askQuestion,
  generateInvoiceEmail,
  getInsights,
} from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';

export const aiRouter = Router({ mergeParams: true });

aiRouter.use(authenticate);

aiRouter.get('/summary', getBusinessSummary);
aiRouter.post('/ask', askQuestion);
aiRouter.get('/insights', getInsights);
aiRouter.post('/invoices/:invoiceId/email', generateInvoiceEmail);
