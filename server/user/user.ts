'use server';

import { prisma } from '@/prisma/db';
import { CreateUserType } from '../user-type';
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

    const hashedPassword = await bcrypt.hash(data.password, 10);
    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        role: data.role,
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
  const status = params.get('status');
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
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        // password: false, // explicitly excluded
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
  } catch (e) {
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
  } catch (e) {
    throw new Error('Failed to update commercial track position');
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
  } catch (e) {
    throw new Error('Failed to User');
  }
};
