import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const lineItemSchema = z.object({
  description: z.string(),
  quantity: z.number().positive(),
  unitPrice: z.number(),
  amount: z.number(),
});

const createInvoiceSchema = z.object({
  customerId: z.string(),
  number: z.string(),
  issueDate: z.string().datetime(),
  dueDate: z.string().datetime(),
  items: z.array(lineItemSchema),
  notes: z.string().optional(),
  tax: z.number().default(0),
});

const updateInvoiceSchema = z.object({
  customerId: z.string().optional(),
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  issueDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  paidDate: z.string().datetime().optional(),
  items: z.array(lineItemSchema).optional(),
  notes: z.string().optional(),
  tax: z.number().optional(),
});

export const getInvoices = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId } = req.params;
    const { status, customerId, limit = '50', offset = '0' } = req.query;

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

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        take: Number(limit),
        skip: Number(offset),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.invoice.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: {
        invoices,
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

export const getInvoice = async (
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

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        businessId,
      },
      include: {
        customer: true,
      },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    res.json({
      status: 'success',
      data: { invoice },
    });
  } catch (error) {
    next(error);
  }
};

export const createInvoice = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId } = req.params;
    const data = createInvoiceSchema.parse(req.body);

    // Verify user has access to business
    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.user.userId,
        businessId,
        role: { in: ['OWNER', 'MANAGER', 'STAFF', 'ACCOUNTANT'] },
      },
    });

    if (!membership) {
      throw new AppError('Insufficient permissions', 403);
    }

    // Calculate totals
    const amount = data.items.reduce((sum, item) => sum + item.amount, 0);
    const total = amount + data.tax;

    const invoice = await prisma.invoice.create({
      data: {
        businessId,
        customerId: data.customerId,
        number: data.number,
        amount,
        tax: data.tax,
        total,
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
        items: data.items,
        notes: data.notes,
        status: 'DRAFT',
      },
      include: {
        customer: true,
      },
    });

    // Log event
    await prisma.event.create({
      data: {
        businessId,
        type: 'USER_ACTION',
        action: 'invoice.created',
        userId: req.user.userId,
        metadata: { invoiceId: invoice.id, invoiceNumber: invoice.number },
      },
    });

    res.status(201).json({
      status: 'success',
      data: { invoice },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Invalid input data', 400));
    }
    next(error);
  }
};

export const updateInvoice = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId, id } = req.params;
    const data = updateInvoiceSchema.parse(req.body);

    // Verify user has access to business
    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.user.userId,
        businessId,
        role: { in: ['OWNER', 'MANAGER', 'STAFF', 'ACCOUNTANT'] },
      },
    });

    if (!membership) {
      throw new AppError('Insufficient permissions', 403);
    }

    // Recalculate totals if items changed
    let updateData: any = { ...data };

    if (data.items) {
      const amount = data.items.reduce((sum, item) => sum + item.amount, 0);
      const tax = data.tax || 0;
      updateData.amount = amount;
      updateData.total = amount + tax;
    }

    // Convert date strings to Date objects
    if (updateData.issueDate) {
      updateData.issueDate = new Date(updateData.issueDate);
    }
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }
    if (updateData.paidDate) {
      updateData.paidDate = new Date(updateData.paidDate);
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
      },
    });

    // Log event
    await prisma.event.create({
      data: {
        businessId,
        type: 'USER_ACTION',
        action: 'invoice.updated',
        userId: req.user.userId,
        metadata: { invoiceId: invoice.id, changes: Object.keys(data) },
      },
    });

    res.json({
      status: 'success',
      data: { invoice },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Invalid input data', 400));
    }
    next(error);
  }
};

export const deleteInvoice = async (
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

    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });

    await prisma.invoice.delete({
      where: { id },
    });

    // Log event
    await prisma.event.create({
      data: {
        businessId,
        type: 'USER_ACTION',
        action: 'invoice.deleted',
        userId: req.user.userId,
        metadata: { invoiceId: id, invoiceNumber: invoice?.number },
      },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
