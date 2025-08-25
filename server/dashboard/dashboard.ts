'use server';

import { prisma } from '@/prisma/db';
import { Prisma } from '@prisma/client';

export const getAllDashboardData = async (data?: string) => {
  const params = new URLSearchParams(data || '');
  // const dateString = params.get('date') || '';
  const year = params.get('year') || '';
  const month = params.get('month') || '';

  const whereConditions = [];

  const buildMonthRange = (y: number, m: number): Prisma.DateTimeFilter => ({
    gte: new Date(y, m - 1, 1, 0, 0, 0, 0),
    lte: new Date(y, m, 0, 23, 59, 59, 999),
  });

  if (month && year) {
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

  const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

  try {
    // Get all payments
    const allPayments = await prisma.payment.findMany({
      where,
      select: {
        amount: true,
        status: true,
      },
    });

    // Get all expenses
    const allExpenses = await prisma.expense.findMany({
      where,
      select: {
        amount: true,
      },
    });

    // Get all salaries
    const allSalaries = await prisma.salary.findMany({
      where,
      select: {
        amount: true,
        status: true,
      },
    });

    // Calculate payment totals
    const totalPayments = allPayments.reduce(
      (total, payment) => total + payment.amount,
      0
    );
    const completedPayments = allPayments
      .filter((payment) => payment.status === 'COMPLETED')
      .reduce((total, payment) => total + payment.amount, 0);
    const pendingPayments = allPayments
      .filter((payment) => payment.status === 'PENDING')
      .reduce((total, payment) => total + payment.amount, 0);
    const failedPayments = allPayments
      .filter((payment) => payment.status === 'FAILED')
      .reduce((total, payment) => total + payment.amount, 0);

    // Calculate expense totals
    const totalExpenses = allExpenses.reduce(
      (total, expense) => total + expense.amount,
      0
    );

    // Calculate salary totals
    const totalSalaries = allSalaries.reduce(
      (total, salary) => total + salary.amount,
      0
    );
    const paidSalaries = allSalaries
      .filter((salary) => salary.status === 'PAID')
      .reduce((total, salary) => total + salary.amount, 0);
    const pendingSalaries = allSalaries
      .filter((salary) => salary.status === 'PENDING')
      .reduce((total, salary) => total + salary.amount, 0);

    // Calculate business metrics
    const totalOutgoing = totalExpenses + paidSalaries; // Only paid salaries count as outgoing
    const totalIncoming = completedPayments; // Only completed payments count as income
    const netProfit = totalIncoming - totalOutgoing; // Profit/Loss calculation
    const pendingIncome = pendingPayments; // Money we expect to receive
    const pendingExpenses = pendingSalaries; // Money we need to pay

    // Calculate percentages for insights
    const expensePercentage =
      totalIncoming > 0 ? Math.round((totalExpenses / totalIncoming) * 100) : 0;
    const salaryPercentage =
      totalIncoming > 0 ? Math.round((paidSalaries / totalIncoming) * 100) : 0;
    const profitMargin =
      totalIncoming > 0 ? Math.round((netProfit / totalIncoming) * 100) : 0;

    // Get counts for dashboard cards
    const paymentCounts = {
      total: allPayments.length,
      completed: allPayments.filter((p) => p.status === 'COMPLETED').length,
      pending: allPayments.filter((p) => p.status === 'PENDING').length,
      failed: allPayments.filter((p) => p.status === 'FAILED').length,
    };

    const expenseCounts = {
      total: allExpenses.length,
    };

    const salaryCounts = {
      total: allSalaries.length,
      paid: allSalaries.filter((s) => s.status === 'PAID').length,
      pending: allSalaries.filter((s) => s.status === 'PENDING').length,
    };

    // Get ALL recent data for dashboard widgets
    const recentPayments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
        task: {
          select: { title: true },
        },
      },
    });

    // Fixed: Remove user include from expenses
    const recentExpenses = await prisma.expense.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const recentSalaries = await prisma.salary.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return {
      success: true,
      data: {
        // Financial Summary
        financial: {
          totalIncoming: completedPayments,
          totalOutgoing,
          netProfit,
          pendingIncome,
          pendingExpenses,
          profitMargin,
        },

        // Detailed Amounts
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
          pending: pendingSalaries,
        },

        // Counts
        counts: {
          payments: paymentCounts,
          expenses: expenseCounts,
          salaries: salaryCounts,
        },

        // Percentages
        insights: {
          expensePercentage,
          salaryPercentage,
          profitMargin,
        },

        // ALL Recent Data (no limit)
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

  // Fetch all tasks
  const allTasks = await prisma.task.findMany({
    where,
    select: {
      amount: true,
    },
  });

  // Fetch all payments
  const allPayments = await prisma.payment.findMany({
    where,
    select: {
      amount: true,
    },
  });

  // Fetch all receivable amounts
  const allReceivables = await prisma.receivableAmount.findMany({
    where,
    select: {
      amount: true,
    },
  });

  // Fetch all expenses
  const allExpenses = await prisma.expense.findMany({
    where,
    select: {
      amount: true,
    },
  });

  // Calculate totals
  const totalPrice = allTasks.reduce((sum, t) => sum + (t.amount || 0), 0);
  const received = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const due = allReceivables.reduce((sum, r) => sum + (r.amount || 0), 0);
  const expense = allExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return {
    totalPrice,
    received,
    due,
    expense,
  };
};
