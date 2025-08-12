'use server';

import { prisma } from '@/prisma/db';
import { SalaryStatus, SalaryType, PaymentType, Prisma } from '@prisma/client';

export async function createSalary({
  amount,
  month,
  year,
  status,
  salaryType,
  paymentType,
  referenceNumber,
  note,
  userId,
}: {
  amount: number;
  month: number;
  year: number;
  status: SalaryStatus;
  salaryType: SalaryType;
  paymentType: PaymentType;
  referenceNumber?: string;
  note?: string;
  userId: string;
}) {
  try {
    // Check if MONTHLY salary already exists for this user/month/year
    // Only restrict MONTHLY salary type, allow multiple BONUS/OVERTIME/DEDUCTION
    if (salaryType === 'MONTHLY') {
      const existingSalary = await prisma.salary.findFirst({
        where: {
          userId: +userId,
          month,
          year,
          salaryType: 'MONTHLY',
        },
      });

      if (existingSalary) {
        throw new Error(
          `Monthly salary for ${month}/${year} already exists for this user`
        );
      }
    }

    const salary = await prisma.salary.create({
      data: {
        amount,
        month,
        year,
        status,
        salaryType,
        paymentType,
        referenceNumber: referenceNumber || null,
        note: note || null,
        userId: +userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      message: 'Salary created successfully',
      salary,
    };
  } catch (e) {
    throw new Error((e as Error)?.message || 'Failed to create salary');
  }
}

export async function updateSalary({
  salaryId,
  amount,
  status,
  salaryType,
  paymentType,
  referenceNumber,
  note,
}: {
  salaryId: number;
  amount?: number;
  status?: SalaryStatus;
  salaryType?: SalaryType;
  paymentType?: PaymentType;
  referenceNumber?: string;
  note?: string;
}) {
  try {
    // If updating to MONTHLY salary type, check for existing monthly salary
    if (salaryType === 'MONTHLY') {
      const currentSalary = await prisma.salary.findUnique({
        where: { id: salaryId },
        select: { userId: true, month: true, year: true, salaryType: true },
      });

      if (currentSalary) {
        // Only check if we're changing TO monthly or if it's already monthly but different record
        const existingMonthlySalary = await prisma.salary.findFirst({
          where: {
            userId: currentSalary.userId,
            month: currentSalary.month,
            year: currentSalary.year,
            salaryType: 'MONTHLY',
            id: { not: salaryId }, // Exclude current record
          },
        });

        if (existingMonthlySalary) {
          throw new Error(
            `Monthly salary for ${currentSalary.month}/${currentSalary.year} already exists for this user`
          );
        }
      }
    }

    const updateData: Prisma.SalaryUpdateInput = {};

    if (amount !== undefined) updateData.amount = amount;
    if (status !== undefined) updateData.status = status;
    if (salaryType !== undefined) updateData.salaryType = salaryType;
    if (paymentType !== undefined) updateData.paymentType = paymentType;
    if (referenceNumber !== undefined)
      updateData.referenceNumber = referenceNumber;
    if (note !== undefined) updateData.note = note;

    const updatedSalary = await prisma.salary.update({
      where: { id: salaryId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      message: 'Salary updated successfully',
      salary: updatedSalary,
    };
  } catch (error) {
    console.error('Error updating salary:', error);
    throw new Error('Failed to update salary');
  }
}

export const fetchAllSalaries = async (data?: string) => {
  const params = new URLSearchParams(data || '');
  const search = params.get('search') || '';
  const page = parseInt(params.get('page') ?? '1') || 1;
  const limit = 10;
  const status = params.get('status') || '';
  const salaryType = params.get('salary_type') || '';
  const paymentType = params.get('payment_type') || '';
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
  const whereConditions: Prisma.SalaryWhereInput[] = [];

  // Search conditions
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
      ],
    });
  }

  // Status filter
  if (
    status &&
    status !== 'ALL' &&
    ['PENDING', 'PAID', 'CANCELLED'].includes(status)
  ) {
    whereConditions.push({
      status: status as SalaryStatus,
    });
  }

  // Salary type filter
  if (
    salaryType &&
    salaryType !== 'ALL' &&
    ['MONTHLY', 'BONUS', 'OVERTIME'].includes(salaryType)
  ) {
    whereConditions.push({
      salaryType: salaryType as SalaryType,
    });
  }

  if (
    paymentType &&
    paymentType !== 'ALL' &&
    ['BANK_TRANSFER', 'BKASH', 'NAGAD'].includes(paymentType)
  ) {
    whereConditions.push({
      paymentType: paymentType as PaymentType,
    });
  }

  // Month filter
  if (month && parseInt(month) >= 1 && parseInt(month) <= 12) {
    whereConditions.push({
      month: parseInt(month),
    });
  }

  // Year filter
  if (year && parseInt(year) > 0) {
    whereConditions.push({
      year: parseInt(year),
    });
  }

  // Date filter
  if (createdAtFilter) {
    whereConditions.push({
      createdAt: createdAtFilter,
    });
  }

  const where: Prisma.SalaryWhereInput =
    whereConditions.length > 0 ? { AND: whereConditions } : {};

  try {
    const count = await prisma.salary.count({ where });
    const totalPages = Math.ceil(count / limit);
    const salaries = await prisma.salary.findMany({
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
      },
    });

    return {
      meta: { count, page, limit, totalPages },
      data: salaries,
    };
  } catch (error) {
    console.error('Error fetching salaries:', error);
    throw new Error('Failed to load salaries');
  }
};

export const fetchUserSalariesByEmail = async (
  email: string,
  data?: string
) => {
  const params = new URLSearchParams(data || '');
  const search = params.get('search') || '';
  const page = parseInt(params.get('page') ?? '1') || 1;
  const limit = 10;
  const status = params.get('status') || '';
  const salaryType = params.get('salary_type') || '';
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
    const whereConditions: Prisma.SalaryWhereInput[] = [{ userId: user.id }];

    // Search conditions
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
            note: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    // Status filter
    if (
      status &&
      status !== 'ALL' &&
      ['PENDING', 'PAID', 'CANCELLED'].includes(status)
    ) {
      whereConditions.push({
        status: status as SalaryStatus,
      });
    }

    // Salary type filter
    if (
      salaryType &&
      salaryType !== 'ALL' &&
      ['MONTHLY', 'BONUS', 'OVERTIME', 'DEDUCTION'].includes(salaryType)
    ) {
      whereConditions.push({
        salaryType: salaryType as SalaryType,
      });
    }

    // Month filter
    if (month && parseInt(month) >= 1 && parseInt(month) <= 12) {
      whereConditions.push({
        month: parseInt(month),
      });
    }

    // Year filter
    if (year && parseInt(year) > 0) {
      whereConditions.push({
        year: parseInt(year),
      });
    }

    const where: Prisma.SalaryWhereInput = { AND: whereConditions };

    const count = await prisma.salary.count({ where });
    const totalPages = Math.ceil(count / limit);
    const salaries = await prisma.salary.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      meta: { count, page, limit, totalPages },
      data: salaries,
    };
  } catch (error) {
    console.error('Error fetching user salaries:', error);
    throw new Error('Failed to load user salaries');
  }
};

export const fetchUserAllSalaries = async (userId: string, data?: string) => {
  const params = new URLSearchParams(data || '');
  const search = params.get('search') || '';
  const page = parseInt(params.get('page') ?? '1') || 1;
  const limit = 10;
  const status = params.get('status') || '';
  const salaryType = params.get('salary_type') || '';
  const month = params.get('month') || '';
  const year = params.get('year') || '';

  // Build where clause
  const whereConditions: Prisma.SalaryWhereInput[] = [{ userId: +userId }];

  // Search conditions
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
          note: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ],
    });
  }

  // Status filter
  if (
    status &&
    status !== 'ALL' &&
    ['PENDING', 'PAID', 'CANCELLED'].includes(status)
  ) {
    whereConditions.push({
      status: status as SalaryStatus,
    });
  }

  // Salary type filter
  if (
    salaryType &&
    salaryType !== 'ALL' &&
    ['MONTHLY', 'BONUS', 'OVERTIME', 'DEDUCTION'].includes(salaryType)
  ) {
    whereConditions.push({
      salaryType: salaryType as SalaryType,
    });
  }

  // Month filter
  if (month && parseInt(month) >= 1 && parseInt(month) <= 12) {
    whereConditions.push({
      month: parseInt(month),
    });
  }

  // Year filter
  if (year && parseInt(year) > 0) {
    whereConditions.push({
      year: parseInt(year),
    });
  }

  const where: Prisma.SalaryWhereInput = { AND: whereConditions };

  try {
    const count = await prisma.salary.count({ where });
    const totalPages = Math.ceil(count / limit);
    const salaries = await prisma.salary.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      meta: { count, page, limit, totalPages },
      data: salaries,
    };
  } catch (error) {
    console.error('Error fetching user salaries:', error);
    throw new Error('Failed to load user salaries');
  }
};

export async function deleteSalary(salaryId: number) {
  try {
    await prisma.salary.delete({
      where: { id: salaryId },
    });

    return {
      message: 'Salary deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting salary:', error);
    throw new Error('Failed to delete salary');
  }
}

export const fetchAllSalariesCalculation = async (data?: string) => {
  const params = new URLSearchParams(data || '');
  const search = params.get('search') || '';
  const status = params.get('status') || '';
  const salaryType = params.get('salary_type') || '';
  const paymentType = params.get('payment_type') || '';
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
  const whereConditions: Prisma.SalaryWhereInput[] = [];

  // Search conditions
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
      ],
    });
  }

  // Status filter
  if (
    status &&
    status !== 'ALL' &&
    ['PENDING', 'PAID', 'CANCELLED'].includes(status)
  ) {
    whereConditions.push({
      status: status as SalaryStatus,
    });
  }

  // Salary type filter
  if (
    salaryType &&
    salaryType !== 'ALL' &&
    ['MONTHLY', 'BONUS', 'OVERTIME'].includes(salaryType)
  ) {
    whereConditions.push({
      salaryType: salaryType as SalaryType,
    });
  }

  if (
    paymentType &&
    paymentType !== 'ALL' &&
    ['BANK_TRANSFER', 'BKASH', 'NAGAD'].includes(paymentType)
  ) {
    whereConditions.push({
      paymentType: paymentType as PaymentType,
    });
  }

  // Month filter
  if (month && parseInt(month) >= 1 && parseInt(month) <= 12) {
    whereConditions.push({
      month: parseInt(month),
    });
  }

  // Year filter
  if (year && parseInt(year) > 0) {
    whereConditions.push({
      year: parseInt(year),
    });
  }

  // Date filter
  if (createdAtFilter) {
    whereConditions.push({
      createdAt: createdAtFilter,
    });
  }

  const where: Prisma.SalaryWhereInput =
    whereConditions.length > 0 ? { AND: whereConditions } : {};

  try {
    // Get total count of all salaries
    const totalSalaries = await prisma.salary.count({ where });

    // Get count by status
    const paidCount = await prisma.salary.count({
      where: { ...where, status: 'PAID' },
    });

    const pendingCount = await prisma.salary.count({
      where: { ...where, status: 'PENDING' },
    });

    const cancelledCount = await prisma.salary.count({
      where: { ...where, status: 'CANCELLED' },
    });

    // Logic for total amount:
    // If no status filter or status is 'ALL' -> show only PAID amount
    // If specific status is filtered -> show amount for that status
    let totalAmount = 0;

    if (!status || status === 'ALL') {
      // Default: show only PAID amount
      const paidAmountResult = await prisma.salary.aggregate({
        where: { ...where, status: 'PAID' },
        _sum: {
          amount: true,
        },
      });
      totalAmount = paidAmountResult._sum.amount || 0;
    } else {
      // Show amount for the filtered status
      const filteredAmountResult = await prisma.salary.aggregate({
        where,
        _sum: {
          amount: true,
        },
      });
      totalAmount = filteredAmountResult._sum.amount || 0;
    }

    const averageAmount = totalSalaries > 0 ? totalAmount / totalSalaries : 0;

    return {
      data: {
        // Total counts
        totalSalaries,
        paidCount,
        pendingCount,
        cancelledCount,

        // Total amount (PAID by default, filtered amount when status filter applied)
        totalAmount,

        // Average
        averageAmount: Math.round(averageAmount * 100) / 100,

        // Percentages
        paidPercentage:
          totalSalaries > 0 ? Math.round((paidCount / totalSalaries) * 100) : 0,
        pendingPercentage:
          totalSalaries > 0
            ? Math.round((pendingCount / totalSalaries) * 100)
            : 0,
        cancelledPercentage:
          totalSalaries > 0
            ? Math.round((cancelledCount / totalSalaries) * 100)
            : 0,
      },
    };
  } catch (error) {
    console.error('Error calculating salary statistics:', error);
    throw new Error('Failed to calculate salary statistics');
  }
};
