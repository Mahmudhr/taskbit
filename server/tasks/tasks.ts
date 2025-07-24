'use server';

import { prisma } from '@/prisma/db';
import { PaperType, Prisma, TaskStatus } from '@prisma/client';
import { CreateTaskType } from '../types/tasks-type';

export async function createTasks(data: CreateTaskType) {
  const { title, description, amount, status, duration, clientId, paper_type } =
    data;
  try {
    const payload: CreateTaskType = {
      title,
      description,
      amount,
      status,
      assignedToId: +data.assignedToId,
      paper_type,
      duration,
    };

    if (clientId) {
      payload.clientId = clientId;
    }
    await prisma.task.create({
      data: payload,
    });
    return {
      message: 'Task Created Successfully',
    };
  } catch (error) {
    throw error;
  }
}

export async function updateTask(id: number, data: CreateTaskType) {
  const { title, description, amount, status, duration, paper_type, clientId } =
    data;
  try {
    const payload: {
      title: string;
      description?: string;
      amount: number;
      status: TaskStatus;
      assignedToId: number;
      paper_type: PaperType;
      duration?: Date;
      updatedAt: Date;
      clientId: number | null;
    } = {
      title,
      description,
      amount,
      status,
      assignedToId: +data.assignedToId,
      paper_type,
      duration,
      updatedAt: new Date(),
      clientId: clientId || null,
    };

    await prisma.task.update({
      where: { id },
      data: payload,
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
  const paper_type = params.get('paper_type') || '';
  const client = params.get('client') || '';
  const dueDate = params.get('due_date') || '';
  const taskCreate = params.get('task_create') || '';
  const paymentStatus = params.get('payment_status') || '';

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

  if (paper_type && paper_type !== 'ALL') {
    (where.AND as Prisma.TaskWhereInput[]).push({
      paper_type: paper_type as PaperType,
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

  if (client && client !== 'ALL') {
    (where.AND as Prisma.TaskWhereInput[]).push({
      client: {
        name: {
          contains: client,
          mode: 'insensitive',
        },
      },
    });
  }

  // Add paymentStatus filter
  if (paymentStatus && paymentStatus !== 'all') {
    if (paymentStatus === 'due') {
      (where.AND as Prisma.TaskWhereInput[]).push({
        amount: {
          gt: 0,
        },
      });
    } else if (paymentStatus === 'paid') {
      (where.AND as Prisma.TaskWhereInput[]).push({
        amount: {
          equals: 0,
        },
      });
    }
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
            id: true,
            name: true,
            email: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        payments: {
          where: {
            status: 'COMPLETED',
          },
          select: {
            amount: true,
          },
        },
      },
    });

    const tasksWithPaid = tasks.map((task) => {
      const paid = task.payments.reduce(
        (total, payment) => total + payment.amount,
        0
      );
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        link: task.link,
        amount: task.amount,
        status: task.status,
        paper_type: task.paper_type,
        isDeleted: task.isDeleted,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        duration: task.duration,
        assignedToId: task.assignedToId,
        clientId: task.clientId,
        createdById: task.createdById,
        assignedTo: task.assignedTo,
        client: task.client,
        paid,
      };
    });

    return {
      meta: { count, page, limit, totalPages },
      data: tasksWithPaid,
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
