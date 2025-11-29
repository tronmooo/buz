import { Router } from 'express';
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customer.controller';
import { authenticate } from '../middleware/auth';

export const customerRouter = Router({ mergeParams: true });

customerRouter.use(authenticate);

customerRouter.get('/', getCustomers);
customerRouter.post('/', createCustomer);
customerRouter.get('/:id', getCustomer);
customerRouter.patch('/:id', updateCustomer);
customerRouter.delete('/:id', deleteCustomer);
