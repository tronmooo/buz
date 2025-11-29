import { Router } from 'express';
import {
  uploadFile,
  getFiles,
  getFile,
  deleteFile,
} from '../controllers/file.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

export const fileRouter = Router({ mergeParams: true });

// All routes require authentication
fileRouter.use(authenticate);

fileRouter.post('/', upload.single('file'), uploadFile);
fileRouter.get('/', getFiles);
fileRouter.get('/:id', getFile);
fileRouter.delete('/:id', deleteFile);
