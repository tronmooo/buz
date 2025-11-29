import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const createContactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const updateContactSchema = createContactSchema.partial();

export const getContacts = async (
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

    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { company: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        take: Number(limit),
        skip: Number(offset),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contact.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: {
        contacts,
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

export const getContact = async (
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

    const contact = await prisma.contact.findFirst({
      where: {
        id,
        businessId,
      },
    });

    if (!contact) {
      throw new AppError('Contact not found', 404);
    }

    res.json({
      status: 'success',
      data: { contact },
    });
  } catch (error) {
    next(error);
  }
};

export const createContact = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId } = req.params;
    const data = createContactSchema.parse(req.body);

    // Verify user has access to business
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

    const contact = await prisma.contact.create({
      data: {
        ...data,
        businessId,
      },
    });

    // Log event
    await prisma.event.create({
      data: {
        businessId,
        type: 'USER_ACTION',
        action: 'contact.created',
        userId: req.user.userId,
        metadata: { contactId: contact.id },
      },
    });

    res.status(201).json({
      status: 'success',
      data: { contact },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Invalid input data', 400));
    }
    next(error);
  }
};

export const updateContact = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId, id } = req.params;
    const data = updateContactSchema.parse(req.body);

    // Verify user has access to business
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

    const contact = await prisma.contact.update({
      where: { id },
      data,
    });

    // Log event
    await prisma.event.create({
      data: {
        businessId,
        type: 'USER_ACTION',
        action: 'contact.updated',
        userId: req.user.userId,
        metadata: { contactId: contact.id },
      },
    });

    res.json({
      status: 'success',
      data: { contact },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Invalid input data', 400));
    }
    next(error);
  }
};

export const deleteContact = async (
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

    await prisma.contact.delete({
      where: { id },
    });

    // Log event
    await prisma.event.create({
      data: {
        businessId,
        type: 'USER_ACTION',
        action: 'contact.deleted',
        userId: req.user.userId,
        metadata: { contactId: id },
      },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
