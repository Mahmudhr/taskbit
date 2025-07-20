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

export async function updateTask(id: number, data: CreateTaskType) {
  const { title, description, amount, status, duration } = data;
  try {
    await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        amount,
        status,
        assignedToId: +data.assignedToId,
        duration,
        updatedAt: new Date(),
      },
    });
    return {
      message: 'Task Updated Successfully',
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

  const dueDate = params.get('due_date') || '';
  const taskCreate = params.get('task_create') || '';

  let dueDateFilter: { gte?: Date; lte?: Date } = {};
  if (dueDate) {
    const filterDate = new Date(dueDate);
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
      dueDateFilter = { gte: start, lte: end };
    }
  }

  let taskCreateFilter: { gte?: Date; lte?: Date } = {};
  if (taskCreate) {
    const filterDate = new Date(taskCreate);
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
      taskCreateFilter = { gte: start, lte: end };
    }
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
  if (dueDateFilter.gte && dueDateFilter.lte) {
    (where.AND as Prisma.TaskWhereInput[]).push({
      duration: dueDateFilter,
    });
  }

  if (taskCreateFilter.gte && taskCreateFilter.lte) {
    (where.AND as Prisma.TaskWhereInput[]).push({
      createdAt: taskCreateFilter,
    });
  }

  try {
    const count = await prisma.task.count({ where });
    const totalPages = Math.ceil(count / limit);
    const tasks = await prisma.task.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedTo: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    return {
      meta: { count, page, limit, totalPages },
      data: tasks,
    };
  } catch {
    throw new Error('Failed to load tasks');
  }
};

export const fetchTasksByUserEmail = async (email: string, option?: string) => {
  if (!email) throw new Error('Email is required');
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) throw new Error('User not found');

    const params = new URLSearchParams(option);
    const search = params.get('search') || '';
    const page = parseInt(params.get('page') ?? '1') || 1;
    const limit = 10;
    const status = params.get('status') || '';
    const dueDate = params.get('due_date') || '';
    const taskCreate = params.get('task_create') || '';

    let dueDateFilter: { gte?: Date; lte?: Date } = {};
    if (dueDate) {
      const filterDate = new Date(dueDate);
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
        dueDateFilter = { gte: start, lte: end };
      }
    }

    let taskCreateFilter: { gte?: Date; lte?: Date } = {};
    if (taskCreate) {
      const filterDate = new Date(taskCreate);
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
        taskCreateFilter = { gte: start, lte: end };
      }
    }

    // Build where clause
    const where: Prisma.TaskWhereInput = {
      AND: [
        { assignedToId: user.id },
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
    if (dueDateFilter.gte && dueDateFilter.lte) {
      (where.AND as Prisma.TaskWhereInput[]).push({
        duration: dueDateFilter,
      });
    }
    if (taskCreateFilter.gte && taskCreateFilter.lte) {
      (where.AND as Prisma.TaskWhereInput[]).push({
        createdAt: taskCreateFilter,
      });
    }

    const count = await prisma.task.count({ where });
    const totalPages = Math.ceil(count / limit);
    const tasks = await prisma.task.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedTo: { select: { name: true, email: true } },
      },
    });
    return {
      meta: { count, page, limit, totalPages },
      data: tasks,
    };
  } catch (error) {
    throw error;
  }
};

export async function deleteTask(id: number) {
  try {
    const updateUser = await prisma.task.update({
      where: { id },
      data: { isDeleted: true },
    });

    return updateUser;
  } catch {
    throw new Error('Failed to delete task');
  }
}
