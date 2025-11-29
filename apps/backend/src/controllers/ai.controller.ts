import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { aiService } from '../services/ai.service';

const askQuestionSchema = z.object({
  question: z.string().min(1),
});

export const getBusinessSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId } = req.params;

    // Verify access
    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.user.userId,
        businessId,
      },
    });

    if (!membership) {
      throw new AppError('Access denied', 403);
    }

    // Fetch business data
    const [business, transactions, invoices, contactsCount, customersCount, accounts] = await Promise.all([
      prisma.business.findUnique({ where: { id: businessId } }),
      prisma.transaction.findMany({
        where: { businessId },
        orderBy: { date: 'desc' },
        take: 20,
        include: { account: true },
      }),
      prisma.invoice.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { customer: true },
      }),
      prisma.contact.count({ where: { businessId } }),
      prisma.customer.count({ where: { businessId } }),
      prisma.account.findMany({ where: { businessId } }),
    ]);

    if (!business) {
      throw new AppError('Business not found', 404);
    }

    // Generate AI summary
    const summary = await aiService.generateBusinessSummary({
      businessName: business.name,
      transactions,
      invoices,
      contacts: contactsCount,
      customers: customersCount,
      accounts,
    });

    // Store as AI insight
    await prisma.aiInsight.create({
      data: {
        businessId,
        type: 'SUMMARY',
        title: 'Business Summary',
        description: summary,
        severity: 'low',
        metadata: {
          generatedAt: new Date().toISOString(),
          dataPoints: {
            transactions: transactions.length,
            invoices: invoices.length,
            contacts: contactsCount,
            customers: customersCount,
          },
        },
      },
    });

    // Log event
    await prisma.event.create({
      data: {
        businessId,
        type: 'AI_ACTION',
        action: 'ai.generate_summary',
        userId: req.user.userId,
        metadata: { summaryLength: summary.length },
      },
    });

    res.json({
      status: 'success',
      data: { summary },
    });
  } catch (error) {
    next(error);
  }
};

export const askQuestion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId } = req.params;
    const { question } = askQuestionSchema.parse(req.body);

    // Verify access
    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.user.userId,
        businessId,
      },
    });

    if (!membership) {
      throw new AppError('Access denied', 403);
    }

    // Fetch relevant business data
    const [business, recentTransactions, recentInvoices, accounts] = await Promise.all([
      prisma.business.findUnique({ where: { id: businessId } }),
      prisma.transaction.findMany({
        where: { businessId },
        orderBy: { date: 'desc' },
        take: 10,
      }),
      prisma.invoice.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.account.findMany({ where: { businessId } }),
    ]);

    if (!business) {
      throw new AppError('Business not found', 404);
    }

    // Get AI answer
    const answer = await aiService.answerBusinessQuestion(question, {
      businessName: business.name,
      recentData: {
        transactions: recentTransactions,
        invoices: recentInvoices,
        accounts,
      },
    });

    // Log event
    await prisma.event.create({
      data: {
        businessId,
        type: 'AI_ACTION',
        action: 'ai.ask_question',
        userId: req.user.userId,
        metadata: { question, answerLength: answer.length },
      },
    });

    res.json({
      status: 'success',
      data: { question, answer },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('Invalid input data', 400));
    }
    next(error);
  }
};

export const generateInvoiceEmail = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId, invoiceId } = req.params;

    // Verify access
    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.user.userId,
        businessId,
      },
    });

    if (!membership) {
      throw new AppError('Access denied', 403);
    }

    // Get invoice
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        businessId,
      },
      include: {
        customer: true,
      },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    // Generate email
    const emailContent = await aiService.generateInvoiceEmail({
      number: invoice.number,
      customerName: invoice.customer.name,
      total: parseFloat(invoice.total.toString()),
      dueDate: invoice.dueDate.toISOString(),
      items: invoice.items as any[],
    });

    // Log event
    await prisma.event.create({
      data: {
        businessId,
        type: 'AI_ACTION',
        action: 'ai.generate_invoice_email',
        userId: req.user.userId,
        metadata: { invoiceId, invoiceNumber: invoice.number },
      },
    });

    res.json({
      status: 'success',
      data: { emailContent },
    });
  } catch (error) {
    next(error);
  }
};

export const getInsights = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { businessId } = req.params;
    const { limit = '10' } = req.query;

    // Verify access
    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.user.userId,
        businessId,
      },
    });

    if (!membership) {
      throw new AppError('Access denied', 403);
    }

    const insights = await prisma.aiInsight.findMany({
      where: {
        businessId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      status: 'success',
      data: { insights },
    });
  } catch (error) {
    next(error);
  }
};
