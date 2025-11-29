import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { canModifyIdentityLegal } from '../utils/rbac';

const ipAssetSchema = z.object({
  type: z.enum(['PATENT', 'TRADEMARK', 'COPYRIGHT', 'TRADE_SECRET', 'OTHER']),
  title: z.string().min(1),
  registrationNumber: z.string().optional(),
  jurisdiction: z.string().optional(),
  status: z.string().optional(),
  filingDate: z.string().datetime().optional(),
  expirationDate: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional(),
});

const updateIpAssetSchema = ipAssetSchema.partial();

const complianceSchema = z.object({
  title: z.string().min(1),
  category: z.string().optional(),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'EXPIRED']).optional(),
  issuedBy: z.string().optional(),
  validFrom: z.string().datetime().optional(),
  validTo: z.string().datetime().optional(),
  fileUrl: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
});

const updateComplianceSchema = complianceSchema.partial();

const policySchema = z.object({
  title: z.string().min(1),
  version: z.string().min(1),
  summary: z.string().optional(),
  content: z.string().optional(),
  effectiveDate: z.string().datetime().optional(),
  retiredAt: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional(),
});

const updatePolicySchema = policySchema.partial();

export const getIpAssets = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId } = req.params;
    const { registrationNumber, search, limit = '50', offset = '0' } = req.query;

    const membership = await prisma.membership.findFirst({
      where: { userId: req.user.userId, businessId },
    });

    if (!membership) {
      throw new AppError('Access denied', 403);
    }

    const where: any = { businessId };

    if (registrationNumber) {
      where.registrationNumber = { contains: registrationNumber as string, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { jurisdiction: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [assets, total] = await Promise.all([
      prisma.intellectualPropertyAsset.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.intellectualPropertyAsset.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: {
        assets,
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

export const getIpAsset = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId, id } = req.params;

    const membership = await prisma.membership.findFirst({
      where: { userId: req.user.userId, businessId },
    });

    if (!membership) {
      throw new AppError('Access denied', 403);
    }

    const asset = await prisma.intellectualPropertyAsset.findFirst({
      where: { id, businessId },
    });

    if (!asset) {
      throw new AppError('IP asset not found', 404);
    }

    res.json({ status: 'success', data: { asset } });
  } catch (error) {
    next(error);
  }
};

export const createIpAsset = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId } = req.params;
    const data = ipAssetSchema.parse(req.body);

    const membership = await prisma.membership.findFirst({
      where: { userId: req.user.userId, businessId },
    });

    if (!membership || !canModifyIdentityLegal(membership.role)) {
      throw new AppError('Insufficient permissions', 403);
    }

    const payload: any = {
      ...data,
      businessId,
    };

    if (payload.filingDate) {
      payload.filingDate = new Date(payload.filingDate);
    }

    if (payload.expirationDate) {
      payload.expirationDate = new Date(payload.expirationDate);
    }

    const asset = await prisma.intellectualPropertyAsset.create({ data: payload });

    await prisma.event.create({
      data: {
        businessId,
        type: 'USER_ACTION',
        action: 'identity.ip_asset.created',
        userId: req.user.userId,
        metadata: { assetId: asset.id },
      },
    });

    res.status(201).json({ status: 'success', data: { asset } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Invalid input data', 400));
    }
    next(error);
  }
};

export const updateIpAsset = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId, id } = req.params;
    const data = updateIpAssetSchema.parse(req.body);

    const membership = await prisma.membership.findFirst({
      where: { userId: req.user.userId, businessId },
    });

    if (!membership || !canModifyIdentityLegal(membership.role)) {
      throw new AppError('Insufficient permissions', 403);
    }

    const payload: any = { ...data };

    if (payload.filingDate) {
      payload.filingDate = new Date(payload.filingDate);
    }

    if (payload.expirationDate) {
      payload.expirationDate = new Date(payload.expirationDate);
    }

    const asset = await prisma.intellectualPropertyAsset.update({
      where: { id },
      data: payload,
    });

    await prisma.event.create({
      data: {
        businessId,
        type: 'USER_ACTION',
        action: 'identity.ip_asset.updated',
        userId: req.user.userId,
        metadata: { assetId: asset.id },
      },
    });

    res.json({ status: 'success', data: { asset } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Invalid input data', 400));
    }
    next(error);
  }
};

export const deleteIpAsset = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId, id } = req.params;

    const membership = await prisma.membership.findFirst({
      where: { userId: req.user.userId, businessId },
    });

    if (!membership || !canModifyIdentityLegal(membership.role)) {
      throw new AppError('Insufficient permissions', 403);
    }

    await prisma.intellectualPropertyAsset.delete({ where: { id } });

    await prisma.event.create({
      data: {
        businessId,
        type: 'USER_ACTION',
        action: 'identity.ip_asset.deleted',
        userId: req.user.userId,
        metadata: { assetId: id },
      },
    });

    res.json({ status: 'success', message: 'IP asset deleted' });
  } catch (error) {
    next(error);
  }
};

export const getComplianceDocuments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId } = req.params;
    const { status, limit = '50', offset = '0' } = req.query;

    const membership = await prisma.membership.findFirst({
      where: { userId: req.user.userId, businessId },
    });

    if (!membership) {
      throw new AppError('Access denied', 403);
    }

    const where: any = { businessId };

    if (status) {
      if (!['DRAFT', 'IN_REVIEW', 'APPROVED', 'EXPIRED'].includes(status as string)) {
        throw new AppError('Invalid status filter', 400);
      }
      where.status = status as string;
    }

    const [documents, total] = await Promise.all([
      prisma.complianceDocument.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.complianceDocument.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: {
        documents,
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

export const getComplianceDocument = async (
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
      where: { userId: req.user.userId, businessId },
    });

    if (!membership) {
      throw new AppError('Access denied', 403);
    }

    const document = await prisma.complianceDocument.findFirst({
      where: { id, businessId },
    });

    if (!document) {
      throw new AppError('Compliance document not found', 404);
    }

    res.json({ status: 'success', data: { document } });
  } catch (error) {
    next(error);
  }
};

export const createComplianceDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId } = req.params;
    const data = complianceSchema.parse(req.body);

    const membership = await prisma.membership.findFirst({
      where: { userId: req.user.userId, businessId },
    });

    if (!membership || !canModifyIdentityLegal(membership.role)) {
      throw new AppError('Insufficient permissions', 403);
    }

    const payload: any = { ...data, businessId };

    if (payload.validFrom) {
      payload.validFrom = new Date(payload.validFrom);
    }

    if (payload.validTo) {
      payload.validTo = new Date(payload.validTo);
    }

    const document = await prisma.complianceDocument.create({ data: payload });

    await prisma.event.create({
      data: {
        businessId,
        type: 'USER_ACTION',
        action: 'identity.compliance_document.created',
        userId: req.user.userId,
        metadata: { documentId: document.id },
      },
    });

    res.status(201).json({ status: 'success', data: { document } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Invalid input data', 400));
    }
    next(error);
  }
};

export const updateComplianceDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId, id } = req.params;
    const data = updateComplianceSchema.parse(req.body);

    const membership = await prisma.membership.findFirst({
      where: { userId: req.user.userId, businessId },
    });

    if (!membership || !canModifyIdentityLegal(membership.role)) {
      throw new AppError('Insufficient permissions', 403);
    }

    const payload: any = { ...data };

    if (payload.validFrom) {
      payload.validFrom = new Date(payload.validFrom);
    }

    if (payload.validTo) {
      payload.validTo = new Date(payload.validTo);
    }

    const document = await prisma.complianceDocument.update({ where: { id }, data: payload });

    await prisma.event.create({
      data: {
        businessId,
        type: 'USER_ACTION',
        action: 'identity.compliance_document.updated',
        userId: req.user.userId,
        metadata: { documentId: document.id },
      },
    });

    res.json({ status: 'success', data: { document } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Invalid input data', 400));
    }
    next(error);
  }
};

export const deleteComplianceDocument = async (
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
      where: { userId: req.user.userId, businessId },
    });

    if (!membership || !canModifyIdentityLegal(membership.role)) {
      throw new AppError('Insufficient permissions', 403);
    }

    await prisma.complianceDocument.delete({ where: { id } });

    await prisma.event.create({
      data: {
        businessId,
        type: 'USER_ACTION',
        action: 'identity.compliance_document.deleted',
        userId: req.user.userId,
        metadata: { documentId: id },
      },
    });

    res.json({ status: 'success', message: 'Compliance document deleted' });
  } catch (error) {
    next(error);
  }
};

export const getInternalPolicies = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId } = req.params;
    const { version, limit = '50', offset = '0' } = req.query;

    const membership = await prisma.membership.findFirst({
      where: { userId: req.user.userId, businessId },
    });

    if (!membership) {
      throw new AppError('Access denied', 403);
    }

    const where: any = { businessId };

    if (version) {
      where.version = version as string;
    }

    const [policies, total] = await Promise.all([
      prisma.internalPolicy.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.internalPolicy.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: {
        policies,
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

export const getInternalPolicy = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId, id } = req.params;

    const membership = await prisma.membership.findFirst({
      where: { userId: req.user.userId, businessId },
    });

    if (!membership) {
      throw new AppError('Access denied', 403);
    }

    const policy = await prisma.internalPolicy.findFirst({
      where: { id, businessId },
    });

    if (!policy) {
      throw new AppError('Policy not found', 404);
    }

    res.json({ status: 'success', data: { policy } });
  } catch (error) {
    next(error);
  }
};

export const createInternalPolicy = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId } = req.params;
    const data = policySchema.parse(req.body);

    const membership = await prisma.membership.findFirst({
      where: { userId: req.user.userId, businessId },
    });

    if (!membership || !canModifyIdentityLegal(membership.role)) {
      throw new AppError('Insufficient permissions', 403);
    }

    const payload: any = { ...data, businessId };

    if (payload.effectiveDate) {
      payload.effectiveDate = new Date(payload.effectiveDate);
    }

    if (payload.retiredAt) {
      payload.retiredAt = new Date(payload.retiredAt);
    }

    const policy = await prisma.internalPolicy.create({ data: payload });

    await prisma.event.create({
      data: {
        businessId,
        type: 'USER_ACTION',
        action: 'identity.policy.created',
        userId: req.user.userId,
        metadata: { policyId: policy.id },
      },
    });

    res.status(201).json({ status: 'success', data: { policy } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Invalid input data', 400));
    }
    next(error);
  }
};

export const updateInternalPolicy = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId, id } = req.params;
    const data = updatePolicySchema.parse(req.body);

    const membership = await prisma.membership.findFirst({
      where: { userId: req.user.userId, businessId },
    });

    if (!membership || !canModifyIdentityLegal(membership.role)) {
      throw new AppError('Insufficient permissions', 403);
    }

    const payload: any = { ...data };

    if (payload.effectiveDate) {
      payload.effectiveDate = new Date(payload.effectiveDate);
    }

    if (payload.retiredAt) {
      payload.retiredAt = new Date(payload.retiredAt);
    }

    const policy = await prisma.internalPolicy.update({ where: { id }, data: payload });

    await prisma.event.create({
      data: {
        businessId,
        type: 'USER_ACTION',
        action: 'identity.policy.updated',
        userId: req.user.userId,
        metadata: { policyId: policy.id },
      },
    });

    res.json({ status: 'success', data: { policy } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Invalid input data', 400));
    }
    next(error);
  }
};

export const deleteInternalPolicy = async (
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
      where: { userId: req.user.userId, businessId },
    });

    if (!membership || !canModifyIdentityLegal(membership.role)) {
      throw new AppError('Insufficient permissions', 403);
    }

    await prisma.internalPolicy.delete({ where: { id } });

    await prisma.event.create({
      data: {
        businessId,
        type: 'USER_ACTION',
        action: 'identity.policy.deleted',
        userId: req.user.userId,
        metadata: { policyId: id },
      },
    });

    res.json({ status: 'success', message: 'Policy deleted' });
  } catch (error) {
    next(error);
  }
};

export const getIdentityLegalDocuments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId } = req.params;

    const membership = await prisma.membership.findFirst({
      where: { userId: req.user.userId, businessId },
    });

    if (!membership) {
      throw new AppError('Access denied', 403);
    }

    const [legalEntities, ipAssets, complianceDocs, policies] = await Promise.all([
      prisma.legalEntity.findMany({ where: { businessId } }),
      prisma.intellectualPropertyAsset.findMany({ where: { businessId } }),
      prisma.complianceDocument.findMany({ where: { businessId } }),
      prisma.internalPolicy.findMany({ where: { businessId } }),
    ]);

    const documents = [
      ...legalEntities.map((entity) => ({
        id: entity.id,
        type: 'legal_entity',
        title: entity.legalName,
        status: entity.isActive ? 'ACTIVE' : 'INACTIVE',
        reference: entity.registrationNum,
        createdAt: entity.createdAt,
      })),
      ...ipAssets.map((asset) => ({
        id: asset.id,
        type: 'intellectual_property_asset',
        title: asset.title,
        status: asset.status || 'UNSPECIFIED',
        reference: asset.registrationNumber,
        createdAt: asset.createdAt,
      })),
      ...complianceDocs.map((doc) => ({
        id: doc.id,
        type: 'compliance_document',
        title: doc.title,
        status: doc.status,
        reference: doc.category,
        createdAt: doc.createdAt,
      })),
      ...policies.map((policy) => ({
        id: policy.id,
        type: 'internal_policy',
        title: policy.title,
        status: policy.retiredAt ? 'RETIRED' : 'ACTIVE',
        reference: policy.version,
        createdAt: policy.createdAt,
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    res.json({ status: 'success', data: { documents } });
  } catch (error) {
    next(error);
  }
};
