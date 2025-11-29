import { Router } from 'express';
import {
  getBusinesses,
  createBusiness,
  getBusiness,
  updateBusiness,
  deleteBusiness,
} from '../controllers/business.controller';
import { authenticate } from '../middleware/auth';

export const businessRouter = Router();

// All business routes require authentication
businessRouter.use(authenticate);

businessRouter.get('/', getBusinesses);
businessRouter.post('/', createBusiness);
businessRouter.get('/:id', getBusiness);
businessRouter.patch('/:id', updateBusiness);
businessRouter.delete('/:id', deleteBusiness);
