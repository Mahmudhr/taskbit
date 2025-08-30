'use server';

import { prisma } from '@/prisma/db';
import { CreateEmployeeOfTheMonthType } from '../types/employee-of-the-month-type';
import { catchError } from '@/lib/utils';
import { Prisma } from '@prisma/client';

export async function createEmployeeOfTheMonth(
  data: CreateEmployeeOfTheMonthType
) {
  const { year, month, description, assignedToId } = data;
  try {
    const existingMonth = await prisma.employeeOfMonth.findFirst({
      where: {
        year,
        month,
      },
    });
    if (existingMonth) {
      throw new Error(
        `Monthly salary for ${month}/${year} already exists for this user`
      );
    }

    await prisma.employeeOfMonth.create({
      data: {
        year,
        month,
        description,
        userId: assignedToId,
      },
    });
    return {
      success: true,
      message: 'Employee of the Month created successfully',
    };
  } catch (error) {
    return catchError(error);
  }
}

export async function fetchAllEmployeesOfTheMonth(data?: string) {
  const params = new URLSearchParams(data || '');
  const search = params.get('search') || '';
  const page = parseInt(params.get('page') ?? '1') || 1;
  const limit = 10;

  const month = params.get('month') || '';
  const year = params.get('year') || '';

  const whereConditions: Prisma.EmployeeOfMonthWhereInput[] = [];

  if (search) {
    whereConditions.push({
      OR: [
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

  const where: Prisma.EmployeeOfMonthWhereInput =
    whereConditions.length > 0 ? { AND: whereConditions } : {};

  try {
    const count = await prisma.employeeOfMonth.count({ where });
    const totalPages = Math.ceil(count / limit);

    const results = await prisma.employeeOfMonth.findMany({
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
    return { meta: { count, page, limit, totalPages }, data: results };
  } catch {
    throw new Error('Failed to load employees of the month');
  }
}
