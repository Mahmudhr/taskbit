'use server';

import { prisma } from '@/prisma/db';
import { PaperType, Prisma, TaskStatus } from '@prisma/client';
import {
  CreateTaskType,
  UpdateUserTaskDeliveryType,
} from '../types/tasks-type';
import { catchError } from '@/lib/utils';

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
    assignedUserIds,
    targetDate,
  } = data;

  try {
    const taskData: {
      title: string;
      description?: string;
      amount: number;
      status: TaskStatus;
      paper_type: PaperType;
      duration?: Date;
      startDate: Date | null;
      clientId?: number;
      targetDate: Date | null;
    } = {
      title,
      description,
      amount,
      status,
      paper_type,
      duration,
      startDate: startDate ? new Date(startDate) : null,
      targetDate: targetDate ? new Date(targetDate) : null,
    };

    if (clientId) {
      taskData.clientId = clientId;
    }

    let userIdsToAssign: number[] = [];

    if (assignedUserIds && Array.isArray(assignedUserIds)) {
      userIdsToAssign = assignedUserIds.map((id) => +id);
    }

    const result = await prisma.$transaction(async (tx) => {
      const newTask = await tx.task.create({
        data: taskData,
      });

      if (userIdsToAssign.length > 0) {
        const existingUsers = await tx.user.findMany({
          where: {
            id: { in: userIdsToAssign },
            isDeleted: false,
            status: 'ACTIVE',
          },
          select: { id: true, name: true },
        });

        if (existingUsers.length !== userIdsToAssign.length) {
          const foundIds = existingUsers.map((u) => u.id);
          const missingIds = userIdsToAssign.filter(
            (id) => !foundIds.includes(id)
          );
          throw new Error(
            `Users not found or inactive: ${missingIds.join(', ')}`
          );
        }

        const taskAssignments = userIdsToAssign.map((userId) => ({
          taskId: newTask.id,
          userId: userId,
          status: 'ACTIVE' as const,
        }));

        await tx.taskAssignment.createMany({
          data: taskAssignments,
        });
      }

      return newTask;
    });

    return {
      success: true,
      message: `Task created successfully and assigned to ${userIdsToAssign.length} user(s)`,
      taskId: result.id,
      assignedUsers: userIdsToAssign.length,
    };
  } catch (error) {
    return catchError(error);
  }
}

// Updated type definition - add this to your types file
// filepath: e:\Frontend\task-management-system\server\types\tasks-type.ts
// export interface CreateTaskType {
//   title: string;
//   description?: string;
//   amount: number;
//   status: TaskStatus;
//   duration?: Date;
//   clientId?: number;
//   paper_type: PaperType;
//   startDate?: Date | null;
//   assignedToId?: number | string | number[]; // Backward compatibility
//   assignedUserIds?: number[]; // New preferred way
// }

// Helper function to add users to existing task
export async function assignUsersToTask(taskId: number, userIds: number[]) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({
        where: { id: taskId, isDeleted: false },
      });

      if (!task) {
        throw new Error('Task not found');
      }

      const existingUsers = await tx.user.findMany({
        where: {
          id: { in: userIds },
          isDeleted: false,
          status: 'ACTIVE',
        },
      });

      if (existingUsers.length !== userIds.length) {
        const foundIds = existingUsers.map((u) => u.id);
        const missingIds = userIds.filter((id) => !foundIds.includes(id));
        throw new Error(
          `Users not found or inactive: ${missingIds.join(', ')}`
        );
      }

      const existingAssignments = await tx.taskAssignment.findMany({
        where: {
          taskId: taskId,
          userId: { in: userIds },
          status: 'ACTIVE',
        },
      });

      const alreadyAssignedIds = existingAssignments.map((a) => a.userId);
      const newAssignments = userIds.filter(
        (id) => !alreadyAssignedIds.includes(id)
      );

      if (newAssignments.length === 0) {
        return {
          message: 'All users are already assigned to this task',
          newAssignments: 0,
        };
      }

      const taskAssignments = newAssignments.map((userId) => ({
        taskId: taskId,
        userId: userId,
        status: 'ACTIVE' as const,
      }));

      await tx.taskAssignment.createMany({
        data: taskAssignments,
      });

      return {
        message: `${newAssignments.length} user(s) assigned to task`,
        newAssignments: newAssignments.length,
      };
    });

    return result;
  } catch (error) {
    console.error('Error assigning users to task:', error);
    return catchError(error);
  }
}

// Helper function to remove users from task
export async function removeUsersFromTask(taskId: number, userIds: number[]) {
  try {
    const result = await prisma.taskAssignment.updateMany({
      where: {
        taskId: taskId,
        userId: { in: userIds },
        status: 'ACTIVE',
      },
      data: {
        status: 'REMOVED',
      },
    });

    return {
      message: `${result.count} user(s) removed from task`,
      removedCount: result.count,
    };
  } catch (error) {
    console.error('Error removing users from task:', error);
    throw error;
  }
}

// Helper function to get task with assigned users
export async function getTaskWithUsers(taskId: number) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId, isDeleted: false },
      include: {
        taskAssignments: {
          where: { status: 'ACTIVE' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
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
          where: { status: 'COMPLETED' },
          select: {
            id: true,
            amount: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    const paid = task.payments.reduce((total, p) => total + p.amount, 0);

    return {
      ...task,
      paid,
    };
  } catch (error) {
    console.error('Error fetching task with users:', error);
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
    assignedUserIds,
    targetDate,
  } = data;

  try {
    await prisma.$transaction(async (tx) => {
      // Update the task
      const updatedTask = await tx.task.update({
        where: { id },
        data: {
          title,
          description,
          amount,
          status,
          paper_type,
          duration,
          updatedAt: new Date(),
          clientId: clientId || null,
          startDate: startDate ? new Date(startDate) : null,
          targetDate,
        },
      });

      if (assignedUserIds !== undefined && Array.isArray(assignedUserIds)) {
        const currentAssignments = await tx.taskAssignment.findMany({
          where: { taskId: id, status: 'ACTIVE' },
          select: { userId: true },
        });

        const currentUserIds = currentAssignments.map((a) => a.userId);
        const newUserIds = assignedUserIds.map((userId) => +userId);

        const usersToRemove = currentUserIds.filter(
          (userId) => !newUserIds.includes(userId)
        );

        const usersToAdd = newUserIds.filter(
          (userId) => !currentUserIds.includes(userId)
        );

        if (usersToRemove.length > 0) {
          await tx.taskAssignment.updateMany({
            where: {
              taskId: id,
              userId: { in: usersToRemove },
              status: 'ACTIVE',
            },
            data: { status: 'REMOVED' },
          });
        }

        if (usersToAdd.length > 0) {
          const existingUsers = await tx.user.findMany({
            where: {
              id: { in: usersToAdd },
              isDeleted: false,
              status: 'ACTIVE',
            },
            select: { id: true },
          });

          if (existingUsers.length !== usersToAdd.length) {
            const foundIds = existingUsers.map((u) => u.id);
            const missingIds = usersToAdd.filter(
              (id) => !foundIds.includes(id)
            );
            throw new Error(
              `Users not found or inactive: ${missingIds.join(', ')}`
            );
          }

          const existingAssignments = await tx.taskAssignment.findMany({
            where: {
              taskId: id,
              userId: { in: usersToAdd },
            },
            select: { userId: true, status: true },
          });

          const existingAssignmentUserIds = existingAssignments.map(
            (a) => a.userId
          );
          const removedAssignments = existingAssignments.filter(
            (a) => a.status === 'REMOVED'
          );
          const removedUserIds = removedAssignments.map((a) => a.userId);

          if (removedUserIds.length > 0) {
            await tx.taskAssignment.updateMany({
              where: {
                taskId: id,
                userId: { in: removedUserIds },
                status: 'REMOVED',
              },
              data: { status: 'ACTIVE' },
            });
          }

          const completelyNewUsers = usersToAdd.filter(
            (userId) => !existingAssignmentUserIds.includes(userId)
          );

          if (completelyNewUsers.length > 0) {
            const newTaskAssignments = completelyNewUsers.map((userId) => ({
              taskId: id,
              userId: userId,
              status: 'ACTIVE' as const,
            }));

            await tx.taskAssignment.createMany({
              data: newTaskAssignments,
            });
          }
        }
      }

      return updatedTask;
    });

    return {
      success: true,
      message: 'Task Updated Successfully',
    };
  } catch (error) {
    return catchError(error);
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
  const assignedUser = params.get('assigned_user') || '';

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
    lte: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999),
  });

  const buildMonthRange = (y: number, m: number): Prisma.DateTimeFilter => ({
    gte: new Date(y, m - 1, 1, 0, 0, 0, 0),
    lte: new Date(y, m, 0, 23, 59, 59, 999),
  });

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
        where: { NOT: { duration: null } },
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

    const nowY = new Date().getFullYear();
    return { start: nowY - 10, end: nowY + 1 };
  };

  const whereConditions: Prisma.TaskWhereInput[] = [{ isDeleted: false }];

  if (search) {
    whereConditions.push({
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
      ],
    });
  }

  if (status && status !== 'ALL') {
    whereConditions.push({ status: status as TaskStatus });
  }

  if (paper_type && paper_type !== 'ALL') {
    whereConditions.push({ paper_type: paper_type as PaperType });
  }

  if (assignedUser && assignedUser !== 'ALL') {
    whereConditions.push({
      taskAssignments: {
        some: {
          status: 'ACTIVE',
          user: {
            name: { contains: assignedUser, mode: 'insensitive' },
          },
        },
      },
    });
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
      const orRanges: Prisma.TaskWhereInput[] = [];
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
      const orRanges: Prisma.TaskWhereInput[] = [];
      for (let y = span.start; y <= span.end; y++) {
        orRanges.push({ createdAt: buildMonthRange(y, m) });
      }
      if (orRanges.length) whereConditions.push({ OR: orRanges });
    }
  }

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
        // Updated: Include taskAssignments instead of single assignedTo
        taskAssignments: {
          where: { status: 'ACTIVE' },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        client: { select: { id: true, name: true, email: true } },
        payments: { where: { status: 'COMPLETED' } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    // Calculate paid amount for each task and format assigned users
    let tasksWithPaid = tasks.map((task) => {
      const paid = task.payments.reduce((total, p) => total + p.amount, 0);

      // Extract assigned users from task assignments
      const assignedUsers = task.taskAssignments.map(
        (assignment) => assignment.user
      );

      return {
        id: task.id,
        title: task.title,
        description: task.description,
        link: task.link,
        status: task.status,
        paper_type: task.paper_type,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        duration: task.duration,
        clientId: task.clientId,
        createdById: task.createdById,
        amount: task.amount,
        target_date: task.targetDate,
        startDate: task.startDate,
        assignedUsers,
        client: task.client,
        payments: task.payments,
        note: task.note,
        createdBy: task.createdBy,
        paid,
      };
    });

    // Payment status filter (note: this is post-query; if you want count/totalPages to reflect this,
    // you'd need to move the logic into the DB via HAVING/SUM on relations or a computed field)
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

// Fixed: Single fetchTasksByUserEmail function with multiple user support
export const fetchTasksByUserEmail = async (email: string, option?: string) => {
  if (!email) throw new Error('Email is required');
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) throw new Error('User not found');

    const params = new URLSearchParams(option || '');
    const search = params.get('search') || '';
    const page = parseInt(params.get('page') ?? '1') || 1;
    const limit = 10;
    const status = params.get('status') || '';
    const paper_type = params.get('paper_type') || '';

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
        const minRec = await prisma.task.findFirst({
          where: {
            taskAssignments: {
              some: { userId: user.id, status: 'ACTIVE' },
            },
            NOT: { duration: null },
          },
          orderBy: { duration: 'asc' },
          select: { duration: true },
        });

        const maxRec = await prisma.task.findFirst({
          where: {
            taskAssignments: {
              some: { userId: user.id, status: 'ACTIVE' },
            },
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
        const minRec = await prisma.task.findFirst({
          where: {
            taskAssignments: {
              some: { userId: user.id, status: 'ACTIVE' },
            },
          },
          orderBy: { createdAt: 'asc' },
          select: { createdAt: true },
        });
        const maxRec = await prisma.task.findFirst({
          where: {
            taskAssignments: {
              some: { userId: user.id, status: 'ACTIVE' },
            },
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

    // Updated: Use taskAssignments for user filtering
    const whereConditions: Prisma.TaskWhereInput[] = [
      {
        taskAssignments: {
          some: { userId: user.id, status: 'ACTIVE' },
        },
      },
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

    const where: Prisma.TaskWhereInput =
      whereConditions.length > 0 ? { AND: whereConditions } : {};

    const count = await prisma.task.count({ where });
    const totalPages = Math.ceil(count / limit);

    const tasks = await prisma.task.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        // Updated: Include taskAssignments instead of single assignedTo
        taskAssignments: {
          where: { status: 'ACTIVE' },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        client: { select: { id: true, name: true, email: true } },
        payments: {
          where: { status: 'COMPLETED' },
        },
      },
    });

    const tasksWithPaid = tasks.map((task) => {
      const paid = task.payments.reduce((total, p) => total + p.amount, 0);

      // Extract assigned users from task assignments
      const assignedUsers = task.taskAssignments.map(
        (assignment) => assignment.user
      );

      return {
        id: task.id,
        title: task.title,
        description: task.description,
        link: task.link,
        status: task.status,
        paper_type: task.paper_type,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        duration: task.duration,
        assignedToId: null, // Clear the assignedToId field
        clientId: task.clientId,
        createdById: task.createdById,
        assignedTo: null, // Clear the assignedTo field
        assignedUsers, // New field: all assigned users
        payments: task.payments,
        note: task.note,
        paid,
      };
    });

    return {
      meta: { count, page, limit, totalPages },
      data: tasksWithPaid,
    };
  } catch (error) {
    console.error('Error fetching user tasks:', error);
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

export const fetchAllTaskCalculation = async (data?: string) => {
  const params = new URLSearchParams(data || '');
  const search = params.get('search') || '';
  const status = params.get('status') || '';
  const paper_type = params.get('paper_type') || '';
  const client = params.get('client') || '';

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
    lte: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999),
  });

  const buildMonthRange = (y: number, m: number): Prisma.DateTimeFilter => ({
    gte: new Date(y, m - 1, 1, 0, 0, 0, 0),
    lte: new Date(y, m, 0, 23, 59, 59, 999),
  });

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
        where: { NOT: { duration: null } },
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

    const nowY = new Date().getFullYear();
    return { start: nowY - 10, end: nowY + 1 };
  };

  const whereConditions: Prisma.TaskWhereInput[] = [{ isDeleted: false }];

  if (search) {
    whereConditions.push({
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
      ],
    });
  }

  if (status && status !== 'ALL') {
    whereConditions.push({ status: status as TaskStatus });
  }

  if (paper_type && paper_type !== 'ALL') {
    whereConditions.push({ paper_type: paper_type as PaperType });
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
      const orRanges: Prisma.TaskWhereInput[] = [];
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
      const orRanges: Prisma.TaskWhereInput[] = [];
      for (let y = span.start; y <= span.end; y++) {
        orRanges.push({ createdAt: buildMonthRange(y, m) });
      }
      if (orRanges.length) whereConditions.push({ OR: orRanges });
    }
  }

  if (client && client !== 'ALL') {
    whereConditions.push({
      client: { name: { contains: client, mode: 'insensitive' } },
    });
  }

  const where: Prisma.TaskWhereInput =
    whereConditions.length > 0 ? { AND: whereConditions } : {};

  try {
    const totalTasks = await prisma.task.count({ where });

    const pendingCount = await prisma.task.count({
      where: { ...where, status: 'PENDING' },
    });

    const inProgressCount = await prisma.task.count({
      where: { ...where, status: 'IN_PROGRESS' },
    });

    const submittedCount = await prisma.task.count({
      where: { ...where, status: 'SUBMITTED' },
    });

    const completedCount = await prisma.task.count({
      where: { ...where, status: 'COMPLETED' },
    });

    const pendingPercentage =
      totalTasks > 0 ? Math.round((pendingCount / totalTasks) * 100) : 0;
    const inProgressPercentage =
      totalTasks > 0 ? Math.round((inProgressCount / totalTasks) * 100) : 0;
    const submittedPercentage =
      totalTasks > 0 ? Math.round((submittedCount / totalTasks) * 100) : 0;
    const completedPercentage =
      totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

    return {
      totalTasks,
      pendingCount,
      inProgressCount,
      submittedCount,
      completedCount,
      pendingPercentage,
      inProgressPercentage,
      submittedPercentage,
      completedPercentage,
    };
  } catch (error) {
    console.error('Error calculating task statistics:', error);
    throw new Error('Failed to calculate task statistics');
  }
};
