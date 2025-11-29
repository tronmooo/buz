import { Router } from 'express';
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transaction.controller';
import { authenticate } from '../middleware/auth';

export const transactionRouter = Router({ mergeParams: true });

// All routes require authentication
transactionRouter.use(authenticate);

transactionRouter.get('/', getTransactions);
transactionRouter.post('/', createTransaction);
transactionRouter.get('/:id', getTransaction);
transactionRouter.patch('/:id', updateTransaction);
transactionRouter.delete('/:id', deleteTransaction);
