import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const createAccountSchema = z.object({
  name: z.string().min(1),
  type: z.enum([
    'CHECKING',
    'SAVINGS',
    'CREDIT_CARD',
    'CASH',
    'ASSET',
    'LIABILITY',
    'EQUITY',
    'REVENUE',
    'EXPENSE',
  ]),
  number: z.string().optional(),
  institution: z.string().optional(),
  balance: z.number().default(0),
  currency: z.string().default('USD'),
});

const updateAccountSchema = createAccountSchema.partial();

export const getAccounts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId } = req.params;
    const { type, isActive } = req.query;

    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.user.userId,
        businessId,
      },
    });

    if (!membership) {
      throw new AppError('Access denied', 403);
    }

    const where: any = { businessId };

    if (type) {
      where.type = type;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const accounts = await prisma.account.findMany({
      where,
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      status: 'success',
      data: { accounts },
    });
  } catch (error) {
    next(error);
  }
};

export const getAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId, id } = req.params;

    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.user.userId,
        businessId,
      },
    });

    if (!membership) {
      throw new AppError('Access denied', 403);
    }

    const account = await prisma.account.findFirst({
      where: {
        id,
        businessId,
      },
      include: {
        transactions: {
          take: 20,
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!account) {
      throw new AppError('Account not found', 404);
    }

    res.json({
      status: 'success',
      data: { account },
    });
  } catch (error) {
    next(error);
  }
};

export const createAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId } = req.params;
    const data = createAccountSchema.parse(req.body);

    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.user.userId,
        businessId,
        role: { in: ['OWNER', 'MANAGER', 'ACCOUNTANT'] },
      },
    });

    if (!membership) {
      throw new AppError('Insufficient permissions', 403);
    }

    const account = await prisma.account.create({
      data: {
        ...data,
        businessId,
      },
    });

    await prisma.event.create({
      data: {
        businessId,
        type: 'USER_ACTION',
        action: 'account.created',
        userId: req.user.userId,
        metadata: { accountId: account.id },
      },
    });

    res.status(201).json({
      status: 'success',
      data: { account },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Invalid input data', 400));
    }
    next(error);
  }
};

export const updateAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId, id } = req.params;
    const data = updateAccountSchema.parse(req.body);

    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.user.userId,
        businessId,
        role: { in: ['OWNER', 'MANAGER', 'ACCOUNTANT'] },
      },
    });

    if (!membership) {
      throw new AppError('Insufficient permissions', 403);
    }

    // Don't allow direct balance updates through this endpoint
    if ('balance' in data) {
      delete (data as any).balance;
    }

    const account = await prisma.account.update({
      where: { id },
      data,
    });

    await prisma.event.create({
      data: {
        businessId,
        type: 'USER_ACTION',
        action: 'account.updated',
        userId: req.user.userId,
        metadata: { accountId: account.id },
      },
    });

    res.json({
      status: 'success',
      data: { account },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Invalid input data', 400));
    }
    next(error);
  }
};

export const deleteAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId, id } = req.params;

    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.user.userId,
        businessId,
        role: { in: ['OWNER', 'MANAGER'] },
      },
    });

    if (!membership) {
      throw new AppError('Insufficient permissions', 403);
    }

    // Check if account has transactions
    const transactionCount = await prisma.transaction.count({
      where: { accountId: id },
    });

    if (transactionCount > 0) {
      throw new AppError(
        'Cannot delete account with existing transactions',
        400
      );
    }

    await prisma.account.delete({
      where: { id },
    });

    await prisma.event.create({
      data: {
        businessId,
        type: 'USER_ACTION',
        action: 'account.deleted',
        userId: req.user.userId,
        metadata: { accountId: id },
      },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
