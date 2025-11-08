'use server';

import { prisma } from '@/prisma/db';

import { ClientTaskType, PaperType, Prisma, TaskStatus } from '@prisma/client';
import { CreateNewClientTaskType } from '../types/client-type';
import { catchError, generateUniqueId } from '@/lib/utils';

export async function createClientTasks(data: CreateNewClientTaskType) {
  const {
    title,
    description,
    amount,
    status,
    duration,
    paper_type,
    unique_id,
    createdById,
    correction_description,
    task_type,
  } = data;

  try {
    // Verify that the user exists and has CLIENT role
    if (!createdById) {
      throw new Error('Creator ID is required');
    }

    const user = await prisma.user.findUnique({
      where: { id: createdById },
      select: { role: true, status: true, name: true, email: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== 'CLIENT') {
      throw new Error(
        'Access denied - Only CLIENT role users can create client tasks'
      );
    }

    if (user.status !== 'ACTIVE') {
      throw new Error('Account is inactive - Cannot create tasks');
    }

    const taskData = {
      title,
      description,
      amount,
      status: status || ('PENDING' as TaskStatus),
      paper_type: paper_type || ('CONFERENCE' as PaperType),
      duration,
      createdById,
      unique_id: unique_id || generateUniqueId(),
      correction_description,
      task_type,
      paid_amount: 0,
    };

    const newClientTask = await prisma.clientTasks.create({
      data: taskData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Client task created successfully',
      data: newClientTask,
      taskId: newClientTask.id,
    };
  } catch (error) {
    return catchError(error);
  }
}

export async function updateClientTasks(data: CreateNewClientTaskType) {
  const {
    id,
    title,
    description,
    amount,
    status,
    duration,
    paper_type,
    unique_id,
    createdById,
    correction_description,
    task_type,
  } = data;
  try {
    const updatedTask = await prisma.clientTasks.update({
      where: { id },
      data: {
        title,
        description,
        amount,
        status,
        duration,
        paper_type,
        unique_id,
        createdById,
        correction_description,
        task_type,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Client task updated successfully',
      data: updatedTask,
    };
  } catch (error) {
    return catchError(error);
  }
}

export async function updateNewClientTasks(data: CreateNewClientTaskType) {
  const {
    id,
    title,
    description,
    amount,
    paid_amount,
    status,
    duration,
    paper_type,
    unique_id,
    createdById,
    correction_description,
    task_type,
  } = data;
  try {
    const updatedTask = await prisma.clientTasks.update({
      where: { id },
      data: {
        title,
        description,
        amount,
        paid_amount,
        status,
        duration,
        paper_type,
        unique_id,
        createdById,
        correction_description,
        task_type,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Client task updated successfully',
      data: updatedTask,
    };
  } catch (error) {
    return catchError(error);
  }
}

export const deleteClientTask = async (taskId: number) => {
  try {
    const updateUser = await prisma.clientTasks.update({
      where: { id: taskId },
      data: { isDeleted: true },
    });

    return updateUser;
  } catch {
    throw new Error('Failed to delete task');
  }
};

export const fetchClientTasksByUserEmail = async (
  email: string,
  option?: string
) => {
  if (!email) throw new Error('Email is required');
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true },
    });
    if (!user) throw new Error('User not found');

    // Verify user has CLIENT role
    if (user.role !== 'CLIENT') {
      throw new Error(
        'Access denied - Only CLIENT role users can view client tasks'
      );
    }

    const params = new URLSearchParams(option || '');
    const search = params.get('search') || '';
    const page = parseInt(params.get('page') ?? '1') || 1;
    const limit = 10;
    const status = params.get('status') || '';
    const paper_type = params.get('paper_type') || '';
    const task_type = params.get('task_type') || '';

    const due_date = params.get('due_date') || '';
    const due_month = params.get('due_month') || '';
    const due_year = params.get('due_year') || '';

    const task_create = params.get('task_create') || '';
    const task_create_month = params.get('task_create_month') || '';
    const task_create_year = params.get('task_create_year') || '';

    const monthToInt = (m: string) => {
      const n = parseInt(m);
      return Number.isFinite(n) && n >= 1 && n <= 12 ? n : undefined;
    };

    const buildDayRange = (d: Date): Prisma.DateTimeFilter => ({
      gte: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0),
      lte: new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        23,
        59,
        59,
        999
      ),
    });

    const buildMonthRange = (y: number, m: number): Prisma.DateTimeFilter => ({
      gte: new Date(y, m - 1, 1, 0, 0, 0, 0),
      lte: new Date(y, m, 0, 23, 59, 59, 999),
    });

    const getYearSpan = async (
      field: 'duration' | 'createdAt'
    ): Promise<{ start: number; end: number }> => {
      if (field === 'duration') {
        const minRec = await prisma.clientTasks.findFirst({
          where: {
            createdById: user.id,
            isDeleted: false,
            NOT: { duration: null },
          },
          orderBy: { duration: 'asc' },
          select: { duration: true },
        });

        const maxRec = await prisma.clientTasks.findFirst({
          where: {
            createdById: user.id,
            isDeleted: false,
            NOT: { duration: null },
          },
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
        const minRec = await prisma.clientTasks.findFirst({
          where: {
            createdById: user.id,
            isDeleted: false,
          },
          orderBy: { createdAt: 'asc' },
          select: { createdAt: true },
        });
        const maxRec = await prisma.clientTasks.findFirst({
          where: {
            createdById: user.id,
            isDeleted: false,
          },
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

      const nowY = new Date().getFullYear();
      return { start: nowY - 10, end: nowY + 1 };
    };

    // Build where conditions for ClientTasks
    const whereConditions: Prisma.ClientTasksWhereInput[] = [
      { createdById: user.id },
      { isDeleted: false },
    ];

    if (search) {
      whereConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (status && status !== 'ALL') {
      whereConditions.push({ status: status as TaskStatus });
    }

    if (paper_type && paper_type !== 'ALL') {
      whereConditions.push({ paper_type: paper_type as PaperType });
    }
    if (task_type && task_type !== 'ALL') {
      whereConditions.push({ task_type: task_type as ClientTaskType });
    }

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
        const orRanges: Prisma.ClientTasksWhereInput[] = [];
        for (let y = span.start; y <= span.end; y++) {
          orRanges.push({ duration: buildMonthRange(y, m) });
        }
        if (orRanges.length) whereConditions.push({ OR: orRanges });
      }
    }

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
        const orRanges: Prisma.ClientTasksWhereInput[] = [];
        for (let y = span.start; y <= span.end; y++) {
          orRanges.push({ createdAt: buildMonthRange(y, m) });
        }
        if (orRanges.length) whereConditions.push({ OR: orRanges });
      }
    }

    const where: Prisma.ClientTasksWhereInput =
      whereConditions.length > 0 ? { AND: whereConditions } : {};

    const count = await prisma.clientTasks.count({ where });
    const totalPages = Math.ceil(count / limit);

    const tasks = await prisma.clientTasks.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        {
          status: 'asc',
        },
        {
          duration: 'asc',
        },
      ],
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    const statusPriority: Record<TaskStatus, number> = {
      IN_PROGRESS: 0,
      PENDING: 1,
      COMPLETED: 2,
      SUBMITTED: 3,
    };

    const sortedTasks = [...tasks].sort((a, b) => {
      const statusDiff =
        (statusPriority[a.status as TaskStatus] ?? 99) -
        (statusPriority[b.status as TaskStatus] ?? 99);
      if (statusDiff !== 0) return statusDiff;

      if (!a.duration) return 1;
      if (!b.duration) return -1;
      return a.duration.getTime() - b.duration.getTime();
    });

    const tasksWithMeta = sortedTasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      amount: task.amount,
      status: task.status,
      paper_type: task.paper_type,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      duration: task.duration,
      unique_id: task.unique_id,
      paid_amount: task.paid_amount,
      correction_description: task.correction_description,
      task_type: task.task_type,
    }));

    return {
      meta: { count, page, limit, totalPages },
      data: tasksWithMeta,
    };
  } catch (error) {
    console.error('Error fetching client tasks:', error);
    throw error;
  }
};

export const fetchClientTasks = async (option?: string) => {
  try {
    const params = new URLSearchParams(option || '');
    const search = params.get('search') || '';
    const page = parseInt(params.get('page') ?? '1') || 1;
    const limit = 10;
    const status = params.get('status') || '';
    const paper_type = params.get('paper_type') || '';
    const task_type = params.get('task_type') || '';

    const due_date = params.get('due_date') || '';
    const due_month = params.get('due_month') || '';
    const due_year = params.get('due_year') || '';

    const task_create = params.get('task_create') || '';
    const task_create_month = params.get('task_create_month') || '';
    const task_create_year = params.get('task_create_year') || '';

    const monthToInt = (m: string) => {
      const n = parseInt(m);
      return Number.isFinite(n) && n >= 1 && n <= 12 ? n : undefined;
    };

    const buildDayRange = (d: Date): Prisma.DateTimeFilter => ({
      gte: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0),
      lte: new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        23,
        59,
        59,
        999
      ),
    });

    const buildMonthRange = (y: number, m: number): Prisma.DateTimeFilter => ({
      gte: new Date(y, m - 1, 1, 0, 0, 0, 0),
      lte: new Date(y, m, 0, 23, 59, 59, 999),
    });

    const getYearSpan = async (
      field: 'duration' | 'createdAt'
    ): Promise<{ start: number; end: number }> => {
      if (field === 'duration') {
        const minRec = await prisma.clientTasks.findFirst({
          where: {
            isDeleted: false,
            NOT: { duration: null },
          },
          orderBy: { duration: 'asc' },
          select: { duration: true },
        });

        const maxRec = await prisma.clientTasks.findFirst({
          where: {
            isDeleted: false,
            NOT: { duration: null },
          },
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
        const minRec = await prisma.clientTasks.findFirst({
          where: {
            isDeleted: false,
          },
          orderBy: { createdAt: 'asc' },
          select: { createdAt: true },
        });
        const maxRec = await prisma.clientTasks.findFirst({
          where: {
            isDeleted: false,
          },
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

      const nowY = new Date().getFullYear();
      return { start: nowY - 10, end: nowY + 1 };
    };

    // Build where conditions for ClientTasks
    const whereConditions: Prisma.ClientTasksWhereInput[] = [
      { isDeleted: false },
    ];

    if (search) {
      whereConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (status && status !== 'ALL') {
      whereConditions.push({ status: status as TaskStatus });
    }

    if (paper_type && paper_type !== 'ALL') {
      whereConditions.push({ paper_type: paper_type as PaperType });
    }
    if (task_type && task_type !== 'ALL') {
      whereConditions.push({ task_type: task_type as ClientTaskType });
    }

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
        const orRanges: Prisma.ClientTasksWhereInput[] = [];
        for (let y = span.start; y <= span.end; y++) {
          orRanges.push({ duration: buildMonthRange(y, m) });
        }
        if (orRanges.length) whereConditions.push({ OR: orRanges });
      }
    }

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
        const orRanges: Prisma.ClientTasksWhereInput[] = [];
        for (let y = span.start; y <= span.end; y++) {
          orRanges.push({ createdAt: buildMonthRange(y, m) });
        }
        if (orRanges.length) whereConditions.push({ OR: orRanges });
      }
    }

    const where: Prisma.ClientTasksWhereInput =
      whereConditions.length > 0 ? { AND: whereConditions } : {};

    const count = await prisma.clientTasks.count({ where });
    const totalPages = Math.ceil(count / limit);

    const tasks = await prisma.clientTasks.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        {
          status: 'asc',
        },
        {
          duration: 'asc',
        },
      ],
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    const statusPriority: Record<TaskStatus, number> = {
      IN_PROGRESS: 0,
      PENDING: 1,
      COMPLETED: 2,
      SUBMITTED: 3,
    };

    const sortedTasks = [...tasks].sort((a, b) => {
      const statusDiff =
        (statusPriority[a.status as TaskStatus] ?? 99) -
        (statusPriority[b.status as TaskStatus] ?? 99);
      if (statusDiff !== 0) return statusDiff;

      if (!a.duration) return 1;
      if (!b.duration) return -1;
      return a.duration.getTime() - b.duration.getTime();
    });

    const tasksWithMeta = sortedTasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      amount: task.amount,
      status: task.status,
      paper_type: task.paper_type,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      duration: task.duration,
      unique_id: task.unique_id,
      createdBy: task.createdBy,
      createdById: task.createdById,
      paid_amount: task.paid_amount,
      correction_description: task.correction_description,
      task_type: task.task_type,
    }));

    return {
      meta: { count, page, limit, totalPages },
      data: tasksWithMeta,
    };
  } catch (error) {
    console.error('Error fetching client tasks:', error);
    throw error;
  }
};
