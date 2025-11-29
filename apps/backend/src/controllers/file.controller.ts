import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import path from 'path';
import fs from 'fs/promises';

export const uploadFile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const { businessId } = req.params;

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

    // Determine file type
    let fileType: 'DOCUMENT' | 'IMAGE' | 'SPREADSHEET' | 'PDF' | 'OTHER' = 'OTHER';
    const mimeType = req.file.mimetype;

    if (mimeType.startsWith('image/')) {
      fileType = 'IMAGE';
    } else if (mimeType === 'application/pdf') {
      fileType = 'PDF';
    } else if (
      mimeType.includes('spreadsheet') ||
      mimeType.includes('excel') ||
      mimeType.includes('csv')
    ) {
      fileType = 'SPREADSHEET';
    } else if (
      mimeType.includes('document') ||
      mimeType.includes('text')
    ) {
      fileType = 'DOCUMENT';
    }

    const file = await prisma.file.create({
      data: {
        businessId,
        name: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        type: fileType,
        url: `/uploads/${req.file.filename}`,
        storageKey: req.file.path,
        uploadedBy: req.user.userId,
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      },
    });

    // Log event
    await prisma.event.create({
      data: {
        businessId,
        type: 'USER_ACTION',
        action: 'file.uploaded',
        userId: req.user.userId,
        metadata: {
          fileId: file.id,
          fileName: file.originalName,
          fileSize: file.size,
        },
      },
    });

    res.status(201).json({
      status: 'success',
      data: { file },
    });
  } catch (error) {
    next(error);
  }
};

export const getFiles = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId } = req.params;
    const { type, search, tags, limit = '50', offset = '0' } = req.query;

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

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { originalName: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (tags) {
      const tagArray = (tags as string).split(',');
      where.tags = {
        hasSome: tagArray,
      };
    }

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where,
        take: Number(limit),
        skip: Number(offset),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.file.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: {
        files,
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

export const getFile = async (
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

    const file = await prisma.file.findFirst({
      where: {
        id,
        businessId,
      },
    });

    if (!file) {
      throw new AppError('File not found', 404);
    }

    res.json({
      status: 'success',
      data: { file },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFile = async (
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
        role: { in: ['OWNER', 'MANAGER', 'STAFF'] },
      },
    });

    if (!membership) {
      throw new AppError('Insufficient permissions', 403);
    }

    const file = await prisma.file.findFirst({
      where: {
        id,
        businessId,
      },
    });

    if (!file) {
      throw new AppError('File not found', 404);
    }

    // Delete physical file
    try {
      await fs.unlink(file.storageKey);
    } catch (err) {
      // File might already be deleted, log but continue
      console.error('Error deleting file:', err);
    }

    // Delete database record
    await prisma.file.delete({
      where: { id },
    });

    // Log event
    await prisma.event.create({
      data: {
        businessId,
        type: 'USER_ACTION',
        action: 'file.deleted',
        userId: req.user.userId,
        metadata: {
          fileId: id,
          fileName: file.originalName,
        },
      },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
