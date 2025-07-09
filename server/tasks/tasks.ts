'use server';

import { prisma } from '@/prisma/db';
import { Prisma, TaskStatus } from '@prisma/client';
import { CreateTaskType } from '../types/tasks-type';

export async function createTasks(data: CreateTaskType) {
  const { title, description, amount, status, duration } = data;
  try {
    await prisma.task.create({
      data: {
        title,
        description,
        amount,
        status,
        assignedToId: +data.assignedToId,
        duration,
      },
    });
    return {
      message: 'Task Created Successfully',
    };
  } catch (error) {
    throw error;
  }
}

export const fetchAllTasks = async (data?: string) => {
  const params = new URLSearchParams(data);
  const search = params.get('search') || '';
  const page = parseInt(params.get('page') ?? '1') || 1;
  const limit = 10;
  const status = params.get('status') || '';
  const dateRange = params.get('date') || 'all';

  // Calculate date filter
  const createdAtFilter: { gte?: Date } = {};
  const now = new Date();
  switch (dateRange) {
    case 'last-day':
      createdAtFilter.gte = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'last-week':
      createdAtFilter.gte = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      break;
    case 'last-month':
      createdAtFilter.gte = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'last-6months':
      createdAtFilter.gte = new Date(now.setMonth(now.getMonth() - 6));
      break;
    case 'last-year':
      createdAtFilter.gte = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    case 'all':
    default:
      // No filter
      break;
  }

  // Build where clause
  const where: Prisma.TaskWhereInput = {
    AND: [
      { OR: [{ isDeleted: false }] },
      {
        OR: [
          {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      },
    ],
  };
  if (status && status !== 'ALL') {
    (where.AND as Prisma.TaskWhereInput[]).push({
      status: status as TaskStatus,
    });
  }
  if (createdAtFilter.gte) {
    (where.AND as Prisma.TaskWhereInput[]).push({ createdAt: createdAtFilter });
  }

  try {
    const count = await prisma.task.count({ where });
    const totalPages = Math.ceil(count / limit);
    const users = await prisma.task.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedTo: true,
      },
    });
    return {
      meta: { count, page, limit, totalPages },
      data: users,
    };
  } catch {
    throw new Error('Failed to load users');
  }
};
