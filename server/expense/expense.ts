'use server';

import { prisma } from '@/prisma/db';
import { Prisma } from '@prisma/client';

export async function createExpense({
  title,
  amount,
}: {
  title: string;
  amount: number;
}) {
  try {
    const expense = await prisma.expense.create({
      data: {
        title,
        amount,
      },
    });

    return {
      message: 'Expense created successfully',
      expense,
    };
  } catch (e) {
    throw new Error((e as Error)?.message || 'Failed to create expense');
  }
}

export async function updateExpense({
  id,
  title,
  amount,
}: {
  id: number;
  title?: string;
  amount?: number;
}) {
  try {
    const updateData: Prisma.ExpenseUpdateInput = {};

    if (title !== undefined) updateData.title = title;
    if (amount !== undefined) updateData.amount = amount;

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: updateData,
    });

    return {
      message: 'Expense updated successfully',
      expense: updatedExpense,
    };
  } catch (error) {
    console.error('Error updating expense:', error);
    throw new Error('Failed to update expense');
  }
}

export const fetchAllExpenses = async (data?: string) => {
  const params = new URLSearchParams(data || '');
  const search = params.get('search') || '';
  const page = parseInt(params.get('page') ?? '1') || 1;
  const limit = 10;
  const month = params.get('month') || '';
  const year = params.get('year') || '';
  const dateString = params.get('date') || '';

  let createdAtFilter: Prisma.DateTimeFilter | undefined;
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
  const whereConditions: Prisma.ExpenseWhereInput[] = [];

  // Search conditions
  if (search) {
    whereConditions.push({
      OR: [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ],
    });
  }

  // Month and Year filter
  if (
    month &&
    year &&
    parseInt(month) >= 1 &&
    parseInt(month) <= 12 &&
    parseInt(year) > 0
  ) {
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(
      parseInt(year),
      parseInt(month),
      0,
      23,
      59,
      59,
      999
    );
    whereConditions.push({
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    });
  }

  // Date filter
  if (createdAtFilter) {
    whereConditions.push({
      createdAt: createdAtFilter,
    });
  }

  const where: Prisma.ExpenseWhereInput =
    whereConditions.length > 0 ? { AND: whereConditions } : {};

  try {
    const count = await prisma.expense.count({ where });
    const totalPages = Math.ceil(count / limit);
    const expenses = await prisma.expense.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return {
      meta: { count, page, limit, totalPages },
      data: expenses,
    };
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw new Error('Failed to load expenses');
  }
};

export const fetchUserExpensesByEmail = async (
  email: string,
  data?: string
) => {
  const params = new URLSearchParams(data || '');
  const search = params.get('search') || '';
  const page = parseInt(params.get('page') ?? '1') || 1;
  const limit = 10;
  const month = params.get('month') || '';
  const year = params.get('year') || '';

  try {
    // First find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Build where clause
    const whereConditions: Prisma.ExpenseWhereInput[] = [{}];

    // Search conditions
    if (search) {
      whereConditions.push({
        OR: [
          {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    // Month and Year filter
    if (
      month &&
      year &&
      parseInt(month) >= 1 &&
      parseInt(month) <= 12 &&
      parseInt(year) > 0
    ) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(
        parseInt(year),
        parseInt(month),
        0,
        23,
        59,
        59,
        999
      );
      whereConditions.push({
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      });
    }

    const where: Prisma.ExpenseWhereInput = { AND: whereConditions };

    const count = await prisma.expense.count({ where });
    const totalPages = Math.ceil(count / limit);
    const expenses = await prisma.expense.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return {
      meta: { count, page, limit, totalPages },
      data: expenses,
    };
  } catch (error) {
    console.error('Error fetching user expenses:', error);
    throw new Error('Failed to load user expenses');
  }
};

export const fetchUserAllExpenses = async (data?: string) => {
  const params = new URLSearchParams(data || '');
  const search = params.get('search') || '';
  const page = parseInt(params.get('page') ?? '1') || 1;
  const limit = 10;
  const month = params.get('month') || '';
  const year = params.get('year') || '';

  // Build where clause
  const whereConditions: Prisma.ExpenseWhereInput[] = [];

  // Search conditions
  if (search) {
    whereConditions.push({
      OR: [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ],
    });
  }

  // Month and Year filter
  if (
    month &&
    year &&
    parseInt(month) >= 1 &&
    parseInt(month) <= 12 &&
    parseInt(year) > 0
  ) {
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(
      parseInt(year),
      parseInt(month),
      0,
      23,
      59,
      59,
      999
    );
    whereConditions.push({
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    });
  }

  const where: Prisma.ExpenseWhereInput =
    whereConditions.length > 0 ? { AND: whereConditions } : {};

  try {
    const count = await prisma.expense.count({ where });
    const totalPages = Math.ceil(count / limit);
    const expenses = await prisma.expense.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return {
      meta: { count, page, limit, totalPages },
      data: expenses,
    };
  } catch (error) {
    console.error('Error fetching user expenses:', error);
    throw new Error('Failed to load user expenses');
  }
};

export async function deleteExpense(expenseId: number) {
  try {
    await prisma.expense.delete({
      where: { id: expenseId },
    });

    return {
      message: 'Expense deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw new Error('Failed to delete expense');
  }
}

export async function getExpenseById(expenseId: number) {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      throw new Error('Expense not found');
    }

    return {
      message: 'Expense fetched successfully',
      expense,
    };
  } catch (error) {
    console.error('Error fetching expense:', error);
    throw new Error('Failed to fetch expense');
  }
}

export const fetchAllExpenseCalculation = async (data?: string) => {
  const params = new URLSearchParams(data || '');
  const search = params.get('search') || '';
  const month = params.get('month') || '';
  const year = params.get('year') || '';
  const dateString = params.get('date') || '';

  let createdAtFilter: Prisma.DateTimeFilter | undefined;
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
  const whereConditions: Prisma.ExpenseWhereInput[] = [];

  // Search conditions
  if (search) {
    whereConditions.push({
      OR: [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ],
    });
  }

  // Month and Year filter
  if (
    month &&
    year &&
    parseInt(month) >= 1 &&
    parseInt(month) <= 12 &&
    parseInt(year) > 0
  ) {
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(
      parseInt(year),
      parseInt(month),
      0,
      23,
      59,
      59,
      999
    );
    whereConditions.push({
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    });
  }

  // Date filter
  if (createdAtFilter) {
    whereConditions.push({
      createdAt: createdAtFilter,
    });
  }

  const where: Prisma.ExpenseWhereInput =
    whereConditions.length > 0 ? { AND: whereConditions } : {};

  try {
    // Get total count
    const totalExpenses = await prisma.expense.count({ where });

    // Get sum of all amounts
    const totalAmountResult = await prisma.expense.aggregate({
      where,
      _sum: {
        amount: true,
      },
    });

    const totalAmount = totalAmountResult._sum.amount || 0;
    const averageAmount = totalExpenses > 0 ? totalAmount / totalExpenses : 0;

    return {
      data: {
        totalExpenses,
        totalAmount,
        averageAmount: Math.round(averageAmount * 100) / 100, // Round to 2 decimal places
      },
    };
  } catch (error) {
    console.error('Error calculating expense statistics:', error);
    throw new Error('Failed to calculate expense statistics');
  }
};
