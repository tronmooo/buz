import { Router } from 'express';
import {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
} from '../controllers/account.controller';
import { authenticate } from '../middleware/auth';

export const accountRouter = Router({ mergeParams: true });

accountRouter.use(authenticate);

accountRouter.get('/', getAccounts);
accountRouter.post('/', createAccount);
accountRouter.get('/:id', getAccount);
accountRouter.patch('/:id', updateAccount);
accountRouter.delete('/:id', deleteAccount);
