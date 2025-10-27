'use server';

import { prisma } from '@/prisma/db';
import { Prisma } from '@prisma/client';

export const getAllDashboardData = async (data?: string) => {
  const params = new URLSearchParams(data || '');
  const year = params.get('year') || '';
  const month = params.get('month') || '';

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

    // Calculate payment totals
    const totalPayments = paymentAgg._sum.amount || 0;
    const totalPaymentsCount = paymentAgg._count._all || 0;
    const completedPayments =
      paymentStatusCounts.find((p) => p.status === 'COMPLETED')?._sum.amount ||
      0;
    const pendingPayments =
      paymentStatusCounts.find((p) => p.status === 'PENDING')?._sum.amount || 0;
    const failedPayments =
      paymentStatusCounts.find((p) => p.status === 'FAILED')?._sum.amount || 0;

    // Calculate salary totals
    const totalSalaries = salaryAgg._sum.amount || 0;
    const totalSalariesCount = salaryAgg._count._all || 0;
    const paidSalaries =
      salaryStatusCounts.find((s) => s.status === 'PAID')?._sum.amount || 0;
    const paidSalariesCount =
      salaryStatusCounts.find((s) => s.status === 'PAID')?._count._all || 0;
    const pendingSalariesCount =
      salaryStatusCounts.find((s) => s.status === 'PENDING')?._count._all || 0;

    // Calculate expense totals (expenses + paid salaries)
    const totalExpenses = (expenseAgg._sum.amount || 0) + paidSalaries;
    const totalExpensesCount = expenseAgg._count._all || 0;

    // Calculate business metrics
    const totalOutgoing = totalExpenses;
    const totalIncoming = completedPayments;

    // Total task price
    const totalTaskPrice = taskAgg._sum.amount || 0;

    // Due = total task price - total received
    const due = totalTaskPrice - completedPayments;

    const netProfit = totalIncoming - totalOutgoing;

    // Get counts for dashboard cards
    const paymentCounts = {
      total: totalPaymentsCount,
      completed:
        paymentStatusCounts.find((p) => p.status === 'COMPLETED')?._count
          ._all || 0,
      pending:
        paymentStatusCounts.find((p) => p.status === 'PENDING')?._count._all ||
        0,
      failed:
        paymentStatusCounts.find((p) => p.status === 'FAILED')?._count._all ||
        0,
    };

    const expenseCounts = {
      total: totalExpensesCount,
    };

    const salaryCounts = {
      total: totalSalariesCount,
      paid: paidSalariesCount,
      pending: pendingSalariesCount,
    };

    return {
      success: true,
      data: {
        financial: {
          totalIncoming: completedPayments,
          totalOutgoing,
          netProfit,
          due,
          profitMargin:
            totalIncoming > 0
              ? Math.round((netProfit / totalIncoming) * 100)
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
              ? Math.round((totalExpenses / totalIncoming) * 100)
              : 0,
          salaryPercentage:
            totalIncoming > 0
              ? Math.round((paidSalaries / totalIncoming) * 100)
              : 0,
          profitMargin:
            totalIncoming > 0
              ? Math.round((netProfit / totalIncoming) * 100)
              : 0,
        },
        recent: {
          payments: recentPayments,
          expenses: recentExpenses,
          salaries: recentSalaries,
        },
      },
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      success: false,
      error: 'Failed to fetch dashboard data',
    };
  }
};

export const getAllDashboardCalc = async (data?: string) => {
  const params = new URLSearchParams(data || '');
  const year = params.get('year') || '';
  const month = params.get('month') || '';

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

  return {
    totalPrice,
    received,
    due,
    expense,
    netIncome,
  };
};
