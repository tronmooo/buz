import { Router } from 'express';
import {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
} from '../controllers/contact.controller';
import { authenticate } from '../middleware/auth';

export const contactRouter = Router({ mergeParams: true });

// All routes require authentication
contactRouter.use(authenticate);

contactRouter.get('/', getContacts);
contactRouter.post('/', createContact);
contactRouter.get('/:id', getContact);
contactRouter.patch('/:id', updateContact);
contactRouter.delete('/:id', deleteContact);
