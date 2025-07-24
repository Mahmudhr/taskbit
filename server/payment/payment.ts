'use server';

import { prisma } from '@/prisma/db';
import { PaymentStatus, PaymentType, Prisma } from '@prisma/client';

export async function createPayment({
  paymentType,
  referenceNumber,
  amount,
  status,
  userId,
  taskId,
}: {
  paymentType: PaymentType;
  referenceNumber: string;
  amount: number;
  status: PaymentStatus;
  userId: string;
  taskId: number;
}) {
  // First, get the current task to check its amount and existing payments
  try {
    const task = await prisma.task.findUnique({
      where: { id: +taskId },
      select: {
        amount: true,
        payments: {
          where: {
            status: 'COMPLETED',
          },
          select: {
            amount: true,
          },
        },
      },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    // Calculate total amount already paid
    const totalPaid = task.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    const remainingAmount = task.amount - totalPaid;

    // Check if new payment amount exceeds remaining amount
    if (amount > remainingAmount) {
      throw new Error('Payment amount cannot exceed remaining task amount');
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create the payment
      const payment = await tx.payment.create({
        data: {
          paymentType,
          referenceNumber,
          amount,
          status,
          userId: +userId,
          taskId: +taskId,
        },
      });

      // const updatedTask = await tx.task.update({
      //   where: { id: +taskId },
      //   data: {
      //     amount: {
      //       decrement: amount,
      //     },
      //   },
      // });

      return { payment };
    });

    return {
      message: 'Payment created successfully',
      payment: result.payment,
    };
  } catch (e) {
    throw new Error((e as Error)?.message || 'Failed to create payment');
  }
}

/**
 * Update payment status and type (user cannot update amount)
 */
export async function updatePaymentByUser({
  paymentId,
  status,
  paymentType,
  referenceNumber,
}: {
  paymentId: number;
  status: PaymentStatus;
  paymentType: PaymentType;
  referenceNumber: string;
}) {
  try {
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        paymentType,
        referenceNumber,
      },
    });
    return {
      message: 'Payment updated successfully',
      payment: updatedPayment,
    };
  } catch {
    throw new Error('Failed to update payment');
  }
}

export const fetchAllPayments = async (data?: string) => {
  const params = new URLSearchParams(data || '');
  const search = params.get('search') || '';
  const page = parseInt(params.get('page') ?? '1') || 1;
  const limit = 10;
  const status = params.get('status') || '';
  const dateString = params.get('date') || '';

  let createdAtFilter: { gte?: Date; lte?: Date } = {};
  if (dateString) {
    const filterDate = new Date(dateString);
    if (!isNaN(filterDate.getTime())) {
      const start = new Date(
        filterDate.getFullYear(),
        filterDate.getMonth(),
        filterDate.getDate(),
        0,
        0,
        0,
        0
      );
      const end = new Date(
        filterDate.getFullYear(),
        filterDate.getMonth(),
        filterDate.getDate(),
        23,
        59,
        59,
        999
      );
      createdAtFilter = { gte: start, lte: end };
    }
  }

  // Build where clause
  const where: Prisma.PaymentWhereInput = {
    AND: [
      {
        OR: [
          {
            referenceNumber: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      },
    ],
  };
  if (
    status &&
    status !== 'ALL' &&
    ['PENDING', 'COMPLETED', 'FAILED'].includes(status)
  ) {
    (where.AND as Prisma.PaymentWhereInput[]).push({
      status: status as PaymentStatus,
    });
  }
  if (createdAtFilter.gte && createdAtFilter.lte) {
    (where.AND as Prisma.PaymentWhereInput[]).push({
      createdAt: createdAtFilter,
    });
  }

  try {
    const count = await prisma.payment.count({ where });
    const totalPages = Math.ceil(count / limit);
    const payments = await prisma.payment.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        task: {
          select: {
            title: true,
            assignedTo: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return {
      meta: { count, page, limit, totalPages },
      data: payments,
    };
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw new Error('Failed to load payments');
  }
};
