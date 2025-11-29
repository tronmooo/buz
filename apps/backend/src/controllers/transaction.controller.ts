import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const createTransactionSchema = z.object({
  accountId: z.string(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  description: z.string().optional(),
  category: z.string().optional(),
  date: z.string().datetime(),
  reconciled: z.boolean().default(false),
  metadata: z.record(z.any()).optional(),
});

const updateTransactionSchema = createTransactionSchema.partial();

export const getTransactions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId } = req.params;
    const {
      accountId,
      type,
      category,
      startDate,
      endDate,
      limit = '50',
      offset = '0',
    } = req.query;

    // Verify user has access to business
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

    if (accountId) {
      where.accountId = accountId;
    }

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.date.lte = new Date(endDate as string);
      }
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          account: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
        take: Number(limit),
        skip: Number(offset),
        orderBy: { date: 'desc' },
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: {
        transactions,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId, id } = req.params;

    // Verify user has access to business
    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.user.userId,
        businessId,
      },
    });

    if (!membership) {
      throw new AppError('Access denied', 403);
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        businessId,
      },
      include: {
        account: true,
      },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    res.json({
      status: 'success',
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId } = req.params;
    const data = createTransactionSchema.parse(req.body);

    // Verify user has access to business
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

    // Verify account belongs to business
    const account = await prisma.account.findFirst({
      where: {
        id: data.accountId,
        businessId,
      },
    });

    if (!account) {
      throw new AppError('Account not found', 404);
    }

    const transaction = await prisma.transaction.create({
      data: {
        businessId,
        accountId: data.accountId,
        type: data.type,
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        category: data.category,
        date: new Date(data.date),
        reconciled: data.reconciled,
        metadata: data.metadata,
      },
      include: {
        account: true,
      },
    });

    // Update account balance
    const balanceChange =
      data.type === 'INCOME' ? data.amount : -data.amount;

    await prisma.account.update({
      where: { id: data.accountId },
      data: {
        balance: {
          increment: balanceChange,
        },
      },
    });

    // Log event
    await prisma.event.create({
      data: {
        businessId,
        type: 'USER_ACTION',
        action: 'transaction.created',
        userId: req.user.userId,
        metadata: {
          transactionId: transaction.id,
          amount: transaction.amount,
          type: transaction.type,
        },
      },
    });

    res.status(201).json({
      status: 'success',
      data: { transaction },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Invalid input data', 400));
    }
    next(error);
  }
};

export const updateTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId, id } = req.params;
    const data = updateTransactionSchema.parse(req.body);

    // Verify user has access to business
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

    // Get original transaction for balance adjustment
    const originalTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!originalTransaction) {
      throw new AppError('Transaction not found', 404);
    }

    let updateData: any = { ...data };
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: updateData,
      include: {
        account: true,
      },
    });

    // Adjust account balance if amount or type changed
    if (data.amount !== undefined || data.type !== undefined) {
      const oldBalance =
        originalTransaction.type === 'INCOME'
          ? originalTransaction.amount
          : -originalTransaction.amount;

      const newBalance =
        (data.type || originalTransaction.type) === 'INCOME'
          ? (data.amount || originalTransaction.amount)
          : -(data.amount || originalTransaction.amount);

      const balanceDiff = newBalance - oldBalance;

      await prisma.account.update({
        where: { id: originalTransaction.accountId },
        data: {
          balance: {
            increment: balanceDiff,
          },
        },
      });
    }

    // Log event
    await prisma.event.create({
      data: {
        businessId,
        type: 'USER_ACTION',
        action: 'transaction.updated',
        userId: req.user.userId,
        metadata: { transactionId: transaction.id },
      },
    });

    res.json({
      status: 'success',
      data: { transaction },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Invalid input data', 400));
    }
    next(error);
  }
};

export const deleteTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId, id } = req.params;

    // Verify user has access to business
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

    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    // Reverse balance change
    const balanceChange =
      transaction.type === 'INCOME'
        ? -transaction.amount
        : transaction.amount;

    await prisma.account.update({
      where: { id: transaction.accountId },
      data: {
        balance: {
          increment: balanceChange,
        },
      },
    });

    await prisma.transaction.delete({
      where: { id },
    });

    // Log event
    await prisma.event.create({
      data: {
        businessId,
        type: 'USER_ACTION',
        action: 'transaction.deleted',
        userId: req.user.userId,
        metadata: { transactionId: id },
      },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
