import { prisma } from '@/prisma/db';
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export const GET = async (request: NextRequest) => {
  // Verify user session
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Unauthorized: Please log in' },
      { status: 401 }
    );
  }

  // Check if user has admin role
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json(
      {
        error: 'Forbidden: You do not have permission to access this resource',
      },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);

  const year = searchParams.get('year') || '';
  const month = searchParams.get('month') || '';

  const buildMonthRange = (y: number, m: number): Prisma.DateTimeFilter => ({
    gte: new Date(y, m - 1, 1, 0, 0, 0, 0),
    lte: new Date(y, m, 0, 23, 59, 59, 999),
  });

  const whereConditions = [];

  if (month && year) {
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    if (monthNum >= 1 && monthNum <= 12 && yearNum > 0) {
      whereConditions.push({
        createdAt: buildMonthRange(yearNum, monthNum),
      });
    }
  } else if (month) {
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

  const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

  const [taskStats, paymentStats, expenseStats] = await Promise.all([
    prisma.task.aggregate({
      where: {
        ...where,
        isDeleted: false,
      },
      _sum: { amount: true },
    }),

    prisma.payment.aggregate({
      where,
      _sum: { amount: true },
    }),

    prisma.expense.aggregate({
      where,
      _sum: { amount: true },
    }),
  ]);

  const totalPrice = taskStats._sum.amount || 0;
  const received = paymentStats._sum.amount || 0;
  const expense = expenseStats._sum.amount || 0;
  const due = totalPrice - received;
  const netIncome = received - expense;
  return NextResponse.json(
    {
      totalPrice,
      received,
      due,
      expense,
      netIncome,
    },
    { status: 200 }
  );
};
