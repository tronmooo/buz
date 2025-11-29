import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const createCustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.record(z.any()).optional(),
  taxId: z.string().optional(),
  paymentTerms: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const updateCustomerSchema = createCustomerSchema.partial();

export const getCustomers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId } = req.params;
    const { search, limit = '50', offset = '0' } = req.query;

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

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          _count: {
            select: {
              invoices: true,
              deals: true,
            },
          },
        },
        take: Number(limit),
        skip: Number(offset),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: {
        customers,
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

export const getCustomer = async (
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

    const customer = await prisma.customer.findFirst({
      where: {
        id,
        businessId,
      },
      include: {
        invoices: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        deals: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    res.json({
      status: 'success',
      data: { customer },
    });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId } = req.params;
    const data = createCustomerSchema.parse(req.body);

    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.user.userId,
        businessId,
        role: { in: ['OWNER', 'MANAGER', 'STAFF'] },
      },
    });

    if (!membership) {
      throw new AppError('Insufficient permissions', 403);
    }

    const customer = await prisma.customer.create({
      data: {
        ...data,
        businessId,
      },
    });

    await prisma.event.create({
      data: {
        businessId,
        type: 'USER_ACTION',
        action: 'customer.created',
        userId: req.user.userId,
        metadata: { customerId: customer.id },
      },
    });

    res.status(201).json({
      status: 'success',
      data: { customer },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Invalid input data', 400));
    }
    next(error);
  }
};

export const updateCustomer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId, id } = req.params;
    const data = updateCustomerSchema.parse(req.body);

    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.user.userId,
        businessId,
        role: { in: ['OWNER', 'MANAGER', 'STAFF'] },
      },
    });

    if (!membership) {
      throw new AppError('Insufficient permissions', 403);
    }

    const customer = await prisma.customer.update({
      where: { id },
      data,
    });

    await prisma.event.create({
      data: {
        businessId,
        type: 'USER_ACTION',
        action: 'customer.updated',
        userId: req.user.userId,
        metadata: { customerId: customer.id },
      },
    });

    res.json({
      status: 'success',
      data: { customer },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Invalid input data', 400));
    }
    next(error);
  }
};

export const deleteCustomer = async (
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

    await prisma.customer.delete({
      where: { id },
    });

    await prisma.event.create({
      data: {
        businessId,
        type: 'USER_ACTION',
        action: 'customer.deleted',
        userId: req.user.userId,
        metadata: { customerId: id },
      },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
