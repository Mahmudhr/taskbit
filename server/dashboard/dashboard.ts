'use server';

import { prisma } from '@/prisma/db';

const getAllDashboardData = async () => {
  try {
    // Get all payments
    const allPayments = await prisma.payment.findMany({
      select: {
        amount: true,
        status: true,
      },
    });

    // Get all expenses
    const allExpenses = await prisma.expense.findMany({
      select: {
        amount: true,
      },
    });

    // Get all salaries
    const allSalaries = await prisma.salary.findMany({
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

export default getAllDashboardData;
