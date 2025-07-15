'use server';

import { prisma } from '@/prisma/db';
import { CreateUserType } from '../types/user-type';
import bcrypt from 'bcryptjs';

export async function createUser(data: CreateUserType) {
  const { email, password, name, phone, role } = data;
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role,
      },
    });
    return {
      message: 'User registered successfully',
    };
  } catch (error) {
    throw error;
  }
}

export const fetchAllUser = async (data?: string) => {
  const params = new URLSearchParams(data);
  const search = params.get('search') || '';
  const page = parseInt(params.get('page') ?? '1') || 1;
  // const status = params.get('status');
  const limit = 10;

  try {
    const count = await prisma.user.count({
      where: {
        AND: [
          {
            OR: [{ status: 'ACTIVE' }, { isDeleted: false }],
          },
          {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                email: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          },
        ],
      },
    });

    const totalPages = Math.ceil(count / limit);

    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [{ status: 'ACTIVE' }, { isDeleted: false }],
          },
          {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                email: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          },
        ],
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
        bkashNumber: true,
        nagadNumber: true,
        bankAccountNumber: true,
        branchName: true,
        bankName: true,
        swiftCode: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        tasks: {
          include: {
            payments: true,
          },
        },
        createdTasks: {
          include: {
            payments: true,
          },
        },
        payments: true,
      },
    });

    return {
      data: users,
      meta: {
        count,
        page,
        limit,
        totalPages,
      },
    };
  } catch {
    throw new Error('Failed to load users');
  }
};

export async function deleteUser(id: number) {
  try {
    const updateUser = await prisma.user.update({
      where: { id },
      data: { isDeleted: true },
    });

    return updateUser;
  } catch {
    throw new Error('Failed to delete user');
  }
}

export const UpdateUser = async ({
  data,
  id,
}: {
  data: CreateUserType;
  id: number;
}) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  try {
    const updateUser = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        phone: data.phone,
        status: data.status,
        updatedAt: new Date(),
      },
    });
    return {
      ...updateUser,
      message: 'User updated successfully',
    };
  } catch {
    throw new Error('Failed to User');
  }
};

/**
 * Search users by name or email (case-insensitive, partial match)
 * @param query string to search (name or email)
 * @returns array of users with id, name, email
 */
export const searchUsers = async (query: string) => {
  if (!query || query.trim() === '') return [];
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
        status: 'ACTIVE',
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      take: 10,
    });
    return users;
  } catch {
    throw new Error('Failed to search users');
  }
};
