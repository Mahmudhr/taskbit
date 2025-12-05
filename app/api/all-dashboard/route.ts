import { prisma } from '@/prisma/db';
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export const GET = async (request: NextRequest) => {
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

  // Filter for tasks by duration
  const taskWhere: Prisma.TaskWhereInput = { isDeleted: false };
  if (month && year) {
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    if (monthNum >= 1 && monthNum <= 12 && yearNum > 0) {
      taskWhere.duration = buildMonthRange(yearNum, monthNum);
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
      taskWhere.OR = years.map((y) => ({
        duration: buildMonthRange(y, monthNum),
      }));
    }
  } else if (year) {
    const yearNum = parseInt(year);
    if (yearNum > 0) {
      taskWhere.duration = {
        gte: new Date(yearNum, 0, 1, 0, 0, 0, 0),
        lte: new Date(yearNum, 11, 31, 23, 59, 59, 999),
      };
    }
  }

  // Payments: filter by createdAt (month/year)
  const paymentWhere: Prisma.PaymentWhereInput = {};
  if (month && year) {
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    if (monthNum >= 1 && monthNum <= 12 && yearNum > 0) {
      paymentWhere.createdAt = buildMonthRange(yearNum, monthNum);
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
      paymentWhere.OR = years.map((y) => ({
        createdAt: buildMonthRange(y, monthNum),
      }));
    }
  } else if (year) {
    const yearNum = parseInt(year);
    if (yearNum > 0) {
      paymentWhere.createdAt = {
        gte: new Date(yearNum, 0, 1, 0, 0, 0, 0),
        lte: new Date(yearNum, 11, 31, 23, 59, 59, 999),
      };
    }
  }

  // Salaries: filter by month/year fields
  const salaryWhere: Prisma.SalaryWhereInput = {};
  if (month && year) {
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    if (monthNum >= 1 && monthNum <= 12 && yearNum > 0) {
      salaryWhere.month = monthNum;
      salaryWhere.year = yearNum;
    }
  } else if (month) {
    const monthNum = parseInt(month);
    if (monthNum >= 1 && monthNum <= 12) {
      salaryWhere.month = monthNum;
    }
  } else if (year) {
    const yearNum = parseInt(year);
    if (yearNum > 0) {
      salaryWhere.year = yearNum;
    }
  }

  // Expenses: filter by createdAt (month/year)
  const expenseWhere: Prisma.ExpenseWhereInput = {};
  if (month && year) {
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    if (monthNum >= 1 && monthNum <= 12 && yearNum > 0) {
      expenseWhere.createdAt = buildMonthRange(yearNum, monthNum);
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
      expenseWhere.OR = years.map((y) => ({
        createdAt: buildMonthRange(y, monthNum),
      }));
    }
  } else if (year) {
    const yearNum = parseInt(year);
    if (yearNum > 0) {
      expenseWhere.createdAt = {
        gte: new Date(yearNum, 0, 1, 0, 0, 0, 0),
        lte: new Date(yearNum, 11, 31, 23, 59, 59, 999),
      };
    }
  }

  try {
    // Run all queries in parallel
    const [
      taskAgg,
      paymentAgg,
      expenseAgg,
      salaryAgg,
      recentPayments,
      recentExpenses,
      recentSalaries,
    ] = await Promise.all([
      prisma.task.aggregate({
        where: taskWhere,
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.payment.aggregate({
        where: paymentWhere,
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.expense.aggregate({
        where: expenseWhere,
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.salary.aggregate({
        where: salaryWhere,
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.payment.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          task: { select: { title: true } },
        },
        take: 10,
      }),
      prisma.expense.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.salary.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
        },
        take: 10,
      }),
    ]);

    // For payment status breakdown, fetch only status fields
    const paymentStatusCounts = await prisma.payment.groupBy({
      by: ['status'],
      where: paymentWhere,
      _count: { _all: true },
      _sum: { amount: true },
    });

    // For salary status breakdown
    const salaryStatusCounts = await prisma.salary.groupBy({
      by: ['status'],
      where: salaryWhere,
      _count: { _all: true },
      _sum: { amount: true },
    });

    // Create maps for efficient status lookups
    const paymentStatusMap = new Map();
    const salaryStatusMap = new Map();

    paymentStatusCounts.forEach((p) => {
      paymentStatusMap.set(p.status, {
        amount: p._sum.amount || 0,
        count: p._count._all || 0,
      });
    });

    salaryStatusCounts.forEach((s) => {
      salaryStatusMap.set(s.status, {
        amount: s._sum.amount || 0,
        count: s._count._all || 0,
      });
    });

    // Calculate payment totals with efficient lookups
    const totalPayments = paymentAgg._sum.amount || 0;
    const totalPaymentsCount = paymentAgg._count._all || 0;
    const completedPayments = paymentStatusMap.get('COMPLETED')?.amount || 0;
    const pendingPayments = paymentStatusMap.get('PENDING')?.amount || 0;
    const failedPayments = paymentStatusMap.get('FAILED')?.amount || 0;

    // Calculate salary totals with efficient lookups
    const totalSalaries = salaryAgg._sum.amount || 0;
    const totalSalariesCount = salaryAgg._count._all || 0;
    const paidSalaries = salaryStatusMap.get('PAID')?.amount || 0;
    const paidSalariesCount = salaryStatusMap.get('PAID')?.count || 0;
    const pendingSalariesCount = salaryStatusMap.get('PENDING')?.count || 0;

    // Calculate expense totals (expenses + paid salaries)
    const totalExpenses = (expenseAgg._sum.amount || 0) + paidSalaries;
    const totalExpensesCount = expenseAgg._count._all || 0;

    // Calculate business metrics
    const totalTaskPrice = taskAgg._sum.amount || 0;
    const totalIncoming = completedPayments;
    const totalOutgoing = totalExpenses;
    const due = totalTaskPrice - completedPayments;
    const netProfit = totalIncoming - totalOutgoing;

    // Pre-calculate percentage base for reuse
    const incomeBase = totalIncoming > 0 ? totalIncoming : 1; // Avoid division by zero

    // Get counts for dashboard cards using efficient lookups
    const paymentCounts = {
      total: totalPaymentsCount,
      completed: paymentStatusMap.get('COMPLETED')?.count || 0,
      pending: paymentStatusMap.get('PENDING')?.count || 0,
      failed: paymentStatusMap.get('FAILED')?.count || 0,
    };

    const expenseCounts = {
      total: totalExpensesCount,
    };

    const salaryCounts = {
      total: totalSalariesCount,
      paid: paidSalariesCount,
      pending: pendingSalariesCount,
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          financial: {
            totalIncoming: completedPayments,
            totalOutgoing,
            netProfit,
            due,
            profitMargin:
              totalIncoming > 0
                ? Math.round((netProfit / incomeBase) * 100)
                : 0,
            totalTaskPrice,
          },
          payments: {
            total: totalPayments,
            completed: completedPayments,
            pending: pendingPayments,
            failed: failedPayments,
          },
          expenses: {
            total: totalExpenses,
          },
          salaries: {
            total: totalSalaries,
            paid: paidSalaries,
            pending: pendingSalariesCount,
          },
          counts: {
            payments: paymentCounts,
            expenses: expenseCounts,
            salaries: salaryCounts,
          },
          insights: {
            expensePercentage:
              totalIncoming > 0
                ? Math.round((totalExpenses / incomeBase) * 100)
                : 0,
            salaryPercentage:
              totalIncoming > 0
                ? Math.round((paidSalaries / incomeBase) * 100)
                : 0,
            profitMargin:
              totalIncoming > 0
                ? Math.round((netProfit / incomeBase) * 100)
                : 0,
          },
          recent: {
            payments: recentPayments,
            expenses: recentExpenses,
            salaries: recentSalaries,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      success: false,
      error: 'Failed to fetch dashboard data',
    };
  }
};
