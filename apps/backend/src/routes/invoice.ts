import { Router } from 'express';
import {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from '../controllers/invoice.controller';
import { authenticate } from '../middleware/auth';

export const invoiceRouter = Router({ mergeParams: true });

// All routes require authentication
invoiceRouter.use(authenticate);

invoiceRouter.get('/', getInvoices);
invoiceRouter.post('/', createInvoice);
invoiceRouter.get('/:id', getInvoice);
invoiceRouter.patch('/:id', updateInvoice);
invoiceRouter.delete('/:id', deleteInvoice);
