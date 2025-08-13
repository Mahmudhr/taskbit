'use server';

import { prisma } from '@/prisma/db';
import { PaperType, Prisma, TaskStatus } from '@prisma/client';
import {
  CreateTaskType,
  UpdateUserTaskDeliveryType,
} from '../types/tasks-type';

export async function createTasks(data: CreateTaskType) {
  const {
    title,
    description,
    amount,
    status,
    duration,
    clientId,
    paper_type,
    startDate,
    assignedToId,
  } = data;
  try {
    const payload: CreateTaskType = {
      title,
      description,
      amount,
      status,
      paper_type,
      duration,
      startDate: startDate ? new Date(startDate) : null,
    };

    if (assignedToId) {
      payload.assignedToId = +assignedToId;
    }

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
  const {
    title,
    description,
    amount,
    status,
    duration,
    paper_type,
    clientId,
    startDate,
    assignedToId,
  } = data;

  try {
    const payload: {
      title: string;
      description?: string;
      amount: number;
      status: TaskStatus;
      assignedToId: number | null;
      paper_type: PaperType;
      duration?: Date;
      updatedAt: Date;
      clientId: number | null;
      startDate?: Date | null;
    } = {
      title,
      description,
      amount,
      status,
      assignedToId: assignedToId || null,
      paper_type,
      duration,
      updatedAt: new Date(),
      clientId: clientId || null,
      startDate: startDate ? new Date(startDate) : null,
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

export async function updateUserTaskDelivery(
  id: number,
  data: UpdateUserTaskDeliveryType
) {
  const { note, link, status } = data;
  try {
    const payload: {
      note?: string | null;
      link?: string | null;
      status?: TaskStatus;
      updatedAt: Date;
    } = {
      note,
      link,
      status,
      updatedAt: new Date(),
    };

    await prisma.task.update({
      where: { id },
      data: payload,
    });
    return {
      message: 'Task Delivery Updated Successfully',
    };
  } catch (error) {
    throw error;
  }
}

export const fetchAllTasks = async (data?: string) => {
  const params = new URLSearchParams(data || '');

  const search = params.get('search') || '';
  const page = parseInt(params.get('page') ?? '1') || 1;
  const limit = 10;
  const status = params.get('status') || '';
  const paper_type = params.get('paper_type') || '';
  const client = params.get('client') || '';
  const paymentStatus = params.get('payment_status') || '';

  // Due filters
  const due_date = params.get('due_date') || '';
  const due_month = params.get('due_month') || '';
  const due_year = params.get('due_year') || '';

  // Task create filters
  const task_create = params.get('task_create') || '';
  const task_create_month = params.get('task_create_month') || '';
  const task_create_year = params.get('task_create_year') || '';

  const monthToInt = (m: string) => {
    const n = parseInt(m);
    return Number.isFinite(n) && n >= 1 && n <= 12 ? n : undefined;
  };

  const buildDayRange = (d: Date): Prisma.DateTimeFilter => ({
    gte: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0),
    lte: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999),
  });

  const buildMonthRange = (y: number, m: number): Prisma.DateTimeFilter => ({
    gte: new Date(y, m - 1, 1, 0, 0, 0, 0),
    lte: new Date(y, m, 0, 23, 59, 59, 999),
  });

  // Find min/max year for a given field to build month-only OR ranges across actual data years
  const getYearSpan = async (
    field: 'duration' | 'createdAt'
  ): Promise<{ start: number; end: number }> => {
    if (field === 'duration') {
      const minRec = await prisma.task.findFirst({
        where: { NOT: { duration: null } },
        orderBy: { duration: 'asc' },
        select: { duration: true },
      });

      const maxRec = await prisma.task.findFirst({
        where: { NOT: [{ duration: null }] },
        orderBy: { duration: 'desc' },
        select: { duration: true },
      });

      if (minRec?.duration && maxRec?.duration) {
        return {
          start: new Date(minRec.duration).getFullYear(),
          end: new Date(maxRec.duration).getFullYear(),
        };
      }
    } else {
      const minRec = await prisma.task.findFirst({
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      });
      const maxRec = await prisma.task.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      });
      if (minRec?.createdAt && maxRec?.createdAt) {
        return {
          start: new Date(minRec.createdAt).getFullYear(),
          end: new Date(maxRec.createdAt).getFullYear(),
        };
      }
    }

    // Fallback span if table is empty or all nulls
    const nowY = new Date().getFullYear();
    return { start: nowY - 10, end: nowY + 1 };
  };

  // Build where clause
  const whereConditions: Prisma.TaskWhereInput[] = [{ isDeleted: false }];

  // Search
  if (search) {
    whereConditions.push({
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
      ],
    });
  }

  // Status
  if (status && status !== 'ALL') {
    whereConditions.push({ status: status as TaskStatus });
  }

  // Paper type
  if (paper_type && paper_type !== 'ALL') {
    whereConditions.push({ paper_type: paper_type as PaperType });
  }

  // -------- Due date filters (field: duration) --------
  let dueDateFilter: Prisma.DateTimeFilter | undefined;
  if (due_date) {
    const d = new Date(due_date);
    if (!isNaN(d.getTime())) dueDateFilter = buildDayRange(d);
  } else if (due_month && due_year) {
    const m = monthToInt(due_month);
    const y = parseInt(due_year);
    if (m && y > 0) dueDateFilter = buildMonthRange(y, m);
  } else if (due_year) {
    const y = parseInt(due_year);
    if (y > 0)
      dueDateFilter = {
        gte: new Date(y, 0, 1, 0, 0, 0, 0),
        lte: new Date(y, 11, 31, 23, 59, 59, 999),
      };
  }

  if (dueDateFilter) {
    whereConditions.push({ duration: dueDateFilter });
  } else if (due_month && !due_year && !due_date) {
    const m = monthToInt(due_month);
    if (m) {
      const span = await getYearSpan('duration');
      const orRanges: Prisma.TaskWhereInput[] = [];
      for (let y = span.start; y <= span.end; y++) {
        orRanges.push({ duration: buildMonthRange(y, m) });
      }
      if (orRanges.length) whereConditions.push({ OR: orRanges });
    }
  }

  // -------- Task created filters (field: createdAt) --------
  let taskCreateFilter: Prisma.DateTimeFilter | undefined;
  if (task_create) {
    const d = new Date(task_create);
    if (!isNaN(d.getTime())) taskCreateFilter = buildDayRange(d);
  } else if (task_create_month && task_create_year) {
    const m = monthToInt(task_create_month);
    const y = parseInt(task_create_year);
    if (m && y > 0) taskCreateFilter = buildMonthRange(y, m);
  } else if (task_create_year) {
    const y = parseInt(task_create_year);
    if (y > 0)
      taskCreateFilter = {
        gte: new Date(y, 0, 1, 0, 0, 0, 0),
        lte: new Date(y, 11, 31, 23, 59, 59, 999),
      };
  }

  if (taskCreateFilter) {
    whereConditions.push({ createdAt: taskCreateFilter });
  } else if (task_create_month && !task_create_year && !task_create) {
    const m = monthToInt(task_create_month);
    if (m) {
      const span = await getYearSpan('createdAt');
      const orRanges: Prisma.TaskWhereInput[] = [];
      for (let y = span.start; y <= span.end; y++) {
        orRanges.push({ createdAt: buildMonthRange(y, m) });
      }
      if (orRanges.length) whereConditions.push({ OR: orRanges });
    }
  }

  // Client
  if (client && client !== 'ALL') {
    whereConditions.push({
      client: { name: { contains: client, mode: 'insensitive' } },
    });
  }

  const where: Prisma.TaskWhereInput =
    whereConditions.length > 0 ? { AND: whereConditions } : {};

  try {
    const count = await prisma.task.count({ where });
    const totalPages = Math.ceil(count / limit);

    const tasks = await prisma.task.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        client: { select: { id: true, name: true, email: true } },
        payments: { where: { status: 'COMPLETED' } },
      },
    });

    // Calculate paid amount for each task
    let tasksWithPaid = tasks.map((task) => {
      const paid = task.payments.reduce((total, p) => total + p.amount, 0);
      return { ...task, paid };
    });

    // Payment status filter (note: this is post-query; if you want count/totalPages to reflect this,
    // you’d need to move the logic into the DB via HAVING/SUM on relations or a computed field)
    if (paymentStatus && paymentStatus !== 'all') {
      tasksWithPaid = tasksWithPaid.filter((task) => {
        const remaining = task.amount - task.paid;
        return paymentStatus === 'paid' ? remaining <= 0 : remaining > 0;
      });
    }

    return { meta: { count, page, limit, totalPages }, data: tasksWithPaid };
  } catch (error) {
    console.error('Error fetching tasks:', error);
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
    const paymentStatus = params.get('payment_status') || '';
    const paper_type = params.get('paper_type') || '';

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

    if (paper_type && paper_type !== 'ALL') {
      (where.AND as Prisma.TaskWhereInput[]).push({
        paper_type: paper_type as PaperType,
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
        payments: {
          where: {
            status: 'COMPLETED',
          },
        },
      },
    });

    let tasksWithPaid = tasks.map((task) => {
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
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        duration: task.duration,
        assignedToId: task.assignedToId,
        clientId: task.clientId,
        createdById: task.createdById,
        assignedTo: task.assignedTo,
        payments: task.payments,
        paid,
        note: task.note,
      };
    });

    if (paymentStatus && paymentStatus !== 'all') {
      tasksWithPaid = tasksWithPaid.filter((task) => {
        const remainingAmount = task.amount - task.paid;

        if (paymentStatus === 'paid') {
          // Task is paid if remaining amount is 0 or less (fully paid/overpaid)
          return remainingAmount <= 0;
        } else if (paymentStatus === 'due') {
          // Task is due if remaining amount is greater than 0
          return remainingAmount > 0;
        }
        return true;
      });
    }

    return {
      meta: { count, page, limit, totalPages },
      data: tasksWithPaid,
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
