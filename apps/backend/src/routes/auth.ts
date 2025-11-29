import { Router } from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/me', authenticate, getCurrentUser);
