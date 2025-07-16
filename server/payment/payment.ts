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
  const payment = await prisma.payment.create({
    data: {
      paymentType,
      referenceNumber,
      amount,
      status,
      userId: +userId,
      taskId: +taskId,
    },
  });
  return { message: 'Payment created successfully', payment };
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
