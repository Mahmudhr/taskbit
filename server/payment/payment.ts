'use server';

import { prisma } from '@/prisma/db';
import { PaymentStatus, PaymentType, TaskStatus, Prisma } from '@prisma/client';

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
      return {
        success: false,
        error: 'TASK_NOT_FOUND',
        message: 'Task not found',
      };
    }

    // Calculate total amount already paid
    const totalPaid = task.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    const remainingAmount = task.amount - totalPaid;

    // Check if new payment amount exceeds remaining amount
    if (amount > remainingAmount) {
      return {
        success: false,
        error: 'PAYMENT_EXCEEDS_REMAINING',
        message: 'Payment amount cannot exceed remaining task amount',
        data: {
          requestedAmount: amount,
          remainingAmount: remainingAmount,
          taskAmount: task.amount,
          totalPaid: totalPaid,
        },
      };
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

      return { payment };
    });

    return {
      success: true,
      message: 'Payment created successfully',
      payment: result.payment,
    };
  } catch (e) {
    console.error('Payment creation error:', e);
    return {
      success: false,
      error: 'PAYMENT_CREATION_FAILED',
      message: 'Failed to create payment',
    };
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
  const year = params.get('year') || '';
  const month = params.get('month') || '';
  const paymentType = params.get('payment_type') || '';

  // Date filtering helper functions
  const buildDayRange = (d: Date): Prisma.DateTimeFilter => ({
    gte: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0),
    lte: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999),
  });

  const buildMonthRange = (y: number, m: number): Prisma.DateTimeFilter => ({
    gte: new Date(y, m - 1, 1, 0, 0, 0, 0),
    lte: new Date(y, m, 0, 23, 59, 59, 999),
  });

  // Build where conditions
  const whereConditions: Prisma.PaymentWhereInput[] = [];

  // Search filter
  if (search) {
    whereConditions.push({
      OR: [
        {
          referenceNumber: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          user: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          user: {
            email: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          task: {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ],
    });
  }

  // Status filter
  if (
    status &&
    status !== 'ALL' &&
    ['PENDING', 'COMPLETED', 'FAILED'].includes(status)
  ) {
    whereConditions.push({
      status: status as PaymentStatus,
    });
  }

  // Payment type filter
  if (
    paymentType &&
    paymentType !== 'ALL' &&
    ['BANK_TRANSFER', 'BKASH', 'NAGAD', 'ROCKET'].includes(paymentType)
  ) {
    whereConditions.push({
      paymentType: paymentType as PaymentType,
    });
  }

  // Date filtering logic
  if (dateString) {
    // Specific date
    const filterDate = new Date(dateString);
    if (!isNaN(filterDate.getTime())) {
      whereConditions.push({
        createdAt: buildDayRange(filterDate),
      });
    }
  } else if (month && year) {
    // Month + Year
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    if (monthNum >= 1 && monthNum <= 12 && yearNum > 0) {
      whereConditions.push({
        createdAt: buildMonthRange(yearNum, monthNum),
      });
    }
  } else if (month) {
    // Month only - across multiple years
    const monthNum = parseInt(month);
    if (monthNum >= 1 && monthNum <= 12) {
      const currentYear = new Date().getFullYear();
      const years = [
        currentYear - 2,
        currentYear - 1,
        currentYear,
        currentYear + 1,
        currentYear + 2,
      ];

      // Create OR condition for month across multiple years
      whereConditions.push({
        OR: years.map((y) => ({
          createdAt: buildMonthRange(y, monthNum),
        })),
      });
    }
  } else if (year) {
    // Year only
    const yearNum = parseInt(year);
    if (yearNum > 0) {
      whereConditions.push({
        createdAt: {
          gte: new Date(yearNum, 0, 1, 0, 0, 0, 0),
          lte: new Date(yearNum, 11, 31, 23, 59, 59, 999),
        },
      });
    }
  }

  const where: Prisma.PaymentWhereInput =
    whereConditions.length > 0 ? { AND: whereConditions } : {};

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
            id: true,
            name: true,
            email: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            amount: true,
            client: {
              select: {
                id: true,
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

export const fetchAllPaymentsCalculation = async (data?: string) => {
  const params = new URLSearchParams(data || '');
  const search = params.get('search') || '';
  const status = params.get('status') || '';
  const dateString = params.get('date') || '';
  const year = params.get('year') || '';
  const month = params.get('month') || '';
  const paymentType = params.get('payment_type') || '';

  // Date filtering helper functions
  const buildDayRange = (d: Date): Prisma.DateTimeFilter => ({
    gte: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0),
    lte: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999),
  });

  const buildMonthRange = (y: number, m: number): Prisma.DateTimeFilter => ({
    gte: new Date(y, m - 1, 1, 0, 0, 0, 0),
    lte: new Date(y, m, 0, 23, 59, 59, 999),
  });

  // Build where conditions (same logic as fetchAllPayments)
  const whereConditions: Prisma.PaymentWhereInput[] = [];

  // Search filter
  if (search) {
    whereConditions.push({
      OR: [
        {
          referenceNumber: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          user: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          user: {
            email: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          task: {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ],
    });
  }

  // Status filter (only if specific status is selected)
  if (status && status !== 'ALL') {
    whereConditions.push({
      status: status as PaymentStatus,
    });
  }

  // Payment type filter
  if (
    paymentType &&
    paymentType !== 'ALL' &&
    ['BANK_TRANSFER', 'BKASH', 'NAGAD', 'ROCKET'].includes(paymentType)
  ) {
    whereConditions.push({
      paymentType: paymentType as PaymentType,
    });
  }

  // Date filtering logic
  if (dateString) {
    // Specific date
    const filterDate = new Date(dateString);
    if (!isNaN(filterDate.getTime())) {
      whereConditions.push({
        createdAt: buildDayRange(filterDate),
      });
    }
  } else if (month && year) {
    // Month + Year
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    if (monthNum >= 1 && monthNum <= 12 && yearNum > 0) {
      whereConditions.push({
        createdAt: buildMonthRange(yearNum, monthNum),
      });
    }
  } else if (month) {
    // Month only - across multiple years
    const monthNum = parseInt(month);
    if (monthNum >= 1 && monthNum <= 12) {
      const currentYear = new Date().getFullYear();
      const years = [
        currentYear - 2,
        currentYear - 1,
        currentYear,
        currentYear + 1,
        currentYear + 2,
      ];

      whereConditions.push({
        OR: years.map((y) => ({
          createdAt: buildMonthRange(y, monthNum),
        })),
      });
    }
  } else if (year) {
    // Year only
    const yearNum = parseInt(year);
    if (yearNum > 0) {
      whereConditions.push({
        createdAt: {
          gte: new Date(yearNum, 0, 1, 0, 0, 0, 0),
          lte: new Date(yearNum, 11, 31, 23, 59, 59, 999),
        },
      });
    }
  }

  const where: Prisma.PaymentWhereInput =
    whereConditions.length > 0 ? { AND: whereConditions } : {};

  try {
    // Get total payment count
    const totalPayments = await prisma.payment.count({ where });

    // Get count by status
    const pendingCount = await prisma.payment.count({
      where: { ...where, status: 'PENDING' },
    });

    const completedCount = await prisma.payment.count({
      where: { ...where, status: 'COMPLETED' },
    });

    const failedCount = await prisma.payment.count({
      where: { ...where, status: 'FAILED' },
    });

    // Get total amount from completed payments only
    const completedPayments = await prisma.payment.findMany({
      where: { ...where, status: 'COMPLETED' },
      select: {
        amount: true,
      },
    });

    const totalCompletedAmount = completedPayments.reduce(
      (total, payment) => total + payment.amount,
      0
    );

    // Get total amount from pending payments
    const pendingPayments = await prisma.payment.findMany({
      where: { ...where, status: 'PENDING' },
      select: {
        amount: true,
      },
    });

    const totalPendingAmount = pendingPayments.reduce(
      (total, payment) => total + payment.amount,
      0
    );

    // Get total amount from failed payments
    const failedPayments = await prisma.payment.findMany({
      where: { ...where, status: 'FAILED' },
      select: {
        amount: true,
      },
    });

    const totalFailedAmount = failedPayments.reduce(
      (total, payment) => total + payment.amount,
      0
    );

    // Calculate total amount of all payments (regardless of status)
    const totalAllAmount =
      totalCompletedAmount + totalPendingAmount + totalFailedAmount;

    // Calculate percentages
    const pendingPercentage =
      totalPayments > 0 ? Math.round((pendingCount / totalPayments) * 100) : 0;
    const completedPercentage =
      totalPayments > 0
        ? Math.round((completedCount / totalPayments) * 100)
        : 0;
    const failedPercentage =
      totalPayments > 0 ? Math.round((failedCount / totalPayments) * 100) : 0;

    return {
      // Payment counts
      totalPayments,
      pendingCount,
      completedCount,
      failedCount,

      // Payment amounts
      totalCompletedAmount, // Only successful payments
      totalPendingAmount, // Pending payments amount
      totalFailedAmount, // Failed payments amount
      totalAllAmount, // Total of all payments

      // Percentages
      pendingPercentage,
      completedPercentage,
      failedPercentage,
    };
  } catch (error) {
    console.error('Error calculating payment statistics:', error);
    throw new Error('Failed to calculate payment statistics');
  }
};

export async function deletePayment(id: number) {
  try {
    const deletedPayment = await prisma.payment.delete({
      where: { id },
    });

    return deletedPayment;
  } catch {
    throw new Error('Failed to delete payment');
  }
}

export async function createReceivableAmount(data: {
  amount: number;
  taskId: number;
}) {
  try {
    const newReceivable = await prisma.receivableAmount.create({
      data: {
        amount: data.amount,
        task: {
          connect: { id: data.taskId },
        },
      },
    });

    return {
      success: true,
      newReceivable,
      message: 'Receivable amount created successfully',
    };
  } catch (error) {
    console.error('Error creating receivable amount:', error);
    throw new Error('Failed to create receivable amount');
  }
}

export const fetchAllPaymentsWithCalculation = async (data?: string) => {
  const params = new URLSearchParams(data || '');
  const search = params.get('search') || '';
  const status = params.get('status') || '';
  const dateString = params.get('date') || '';
  const year = params.get('year') || '';
  const month = params.get('month') || '';
  const paymentType = params.get('payment_type') || '';

  // Build where conditions for tasks
  const whereConditions: Prisma.TaskWhereInput = { isDeleted: false };

  // Search filter (title or client name)
  if (search) {
    whereConditions.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { client: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  // Status filter
  if (status && status !== 'ALL') {
    whereConditions.status = status as TaskStatus;
  }

  // Date filter (duration or createdAt)
  if (dateString) {
    const filterDate = new Date(dateString);
    if (!isNaN(filterDate.getTime())) {
      whereConditions.createdAt = {
        gte: new Date(
          filterDate.getFullYear(),
          filterDate.getMonth(),
          filterDate.getDate(),
          0,
          0,
          0,
          0
        ),
        lte: new Date(
          filterDate.getFullYear(),
          filterDate.getMonth(),
          filterDate.getDate(),
          23,
          59,
          59,
          999
        ),
      };
    }
  } else if (month && year) {
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    if (monthNum >= 1 && monthNum <= 12 && yearNum > 0) {
      whereConditions.createdAt = {
        gte: new Date(yearNum, monthNum - 1, 1, 0, 0, 0, 0),
        lte: new Date(yearNum, monthNum, 0, 23, 59, 59, 999),
      };
    }
  } else if (year) {
    const yearNum = parseInt(year);
    if (yearNum > 0) {
      whereConditions.createdAt = {
        gte: new Date(yearNum, 0, 1, 0, 0, 0, 0),
        lte: new Date(yearNum, 11, 31, 23, 59, 59, 999),
      };
    }
  }

  // PaymentType filter (for payments inside each task)
  let paymentTypeFilter: Prisma.PaymentWhereInput | undefined = undefined;
  if (paymentType && paymentType !== 'ALL') {
    paymentTypeFilter = { paymentType: paymentType as PaymentType };
  }

  // Get all filtered tasks
  const tasks = await prisma.task.findMany({
    where: whereConditions,
    select: {
      id: true,
      amount: true,
      payments: paymentTypeFilter
        ? { where: paymentTypeFilter, select: { amount: true } }
        : { select: { amount: true } },
      receivableAmounts: { select: { amount: true } },
    },
  });

  // Total amount and task count
  const totalAmount = tasks.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalTaskCount = tasks.length;

  // Paid amount and paid task count
  let paidAmount = 0;
  let paidTaskCount = 0;
  tasks.forEach((t) => {
    const taskPaid = t.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    paidAmount += taskPaid;
    if (taskPaid > 0) paidTaskCount += 1;
  });

  // Receivable amount and receivable task count
  let receivableAmount = 0;
  let receivableTaskCount = 0;
  tasks.forEach((t) => {
    const taskReceivable = t.receivableAmounts.reduce(
      (sum, r) => sum + (r.amount || 0),
      0
    );
    receivableAmount += taskReceivable;
    if (taskReceivable > 0) receivableTaskCount += 1;
  });

  return {
    totalAmount,
    totalTaskCount,
    paidAmount,
    paidTaskCount,
    receivableAmount,
    receivableTaskCount,
  };
};
