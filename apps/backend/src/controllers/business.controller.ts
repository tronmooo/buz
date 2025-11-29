import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const createBusinessSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().url().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export const getBusinesses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const businesses = await prisma.business.findMany({
      where: {
        memberships: {
          some: {
            userId: req.user.userId,
          },
        },
      },
      include: {
        memberships: {
          where: {
            userId: req.user.userId,
          },
          select: {
            role: true,
          },
        },
      },
    });

    res.json({
      status: 'success',
      data: { businesses },
    });
  } catch (error) {
    next(error);
  }
};

export const createBusiness = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const data = createBusinessSchema.parse(req.body);

    // Check if slug is available
    const existing = await prisma.business.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new AppError('Business slug already taken', 400);
    }

    // Create business and membership
    const business = await prisma.business.create({
      data: {
        ...data,
        memberships: {
          create: {
            userId: req.user.userId,
            role: 'OWNER',
          },
        },
      },
      include: {
        memberships: true,
      },
    });

    res.status(201).json({
      status: 'success',
      data: { business },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Invalid input data', 400));
    }
    next(error);
  }
};

export const getBusiness = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const business = await prisma.business.findFirst({
      where: {
        id: req.params.id,
        memberships: {
          some: {
            userId: req.user.userId,
          },
        },
      },
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!business) {
      throw new AppError('Business not found', 404);
    }

    res.json({
      status: 'success',
      data: { business },
    });
  } catch (error) {
    next(error);
  }
};

export const updateBusiness = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    // Check if user has permission (OWNER or MANAGER)
    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.user.userId,
        businessId: req.params.id,
        role: {
          in: ['OWNER', 'MANAGER'],
        },
      },
    });

    if (!membership) {
      throw new AppError('Insufficient permissions', 403);
    }

    const business = await prisma.business.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json({
      status: 'success',
      data: { business },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBusiness = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    // Only OWNER can delete
    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.user.userId,
        businessId: req.params.id,
        role: 'OWNER',
      },
    });

    if (!membership) {
      throw new AppError('Insufficient permissions', 403);
    }

    await prisma.business.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
