'use server';

import { prisma } from '@/prisma/db';
import { CreateUserType } from '../types/user-type';
import bcrypt from 'bcryptjs';
import { $Enums } from '@prisma/client';
import { catchError } from '@/lib/utils';

export async function createUser(data: CreateUserType) {
  const { email, password, name, phone, role, salary } = data;
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
        salary,
      },
    });
    return {
      success: true,
      message: 'User registered successfully',
    };
  } catch (error) {
    return catchError(error);
  }
}

export const fetchAllUser = async (data?: string) => {
  const params = new URLSearchParams(data);
  const search = params.get('search') || '';
  const page = parseInt(params.get('page') ?? '1') || 1;
  const status = params.get('status');
  const role = params.get('role');
  const limit = 10;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {
      AND: [
        { OR: [{ isDeleted: false }] },
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
            {
              phone: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        },
      ],
    };

    // Add status filter if provided
    if (status && status !== 'all') {
      whereClause.AND.push({
        status: status.toUpperCase(),
      });
    }

    // Add role filter if provided
    if (role && role !== 'all') {
      whereClause.AND.push({
        role: role.toUpperCase(),
      });
    }

    const count = await prisma.user.count({
      where: whereClause,
    });

    const totalPages = Math.ceil(count / limit);

    const users = await prisma.user.findMany({
      where: whereClause,
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
        salary: true,
        salaries: {
          select: {
            id: true,
            month: true,
            year: true,
            salaryType: true,
            amount: true,
            referenceNumber: true,
            paymentType: true,
            status: true,
            createdAt: true,
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

  const payload: {
    name: string;
    email: string;
    password?: string;
    role: $Enums.Role;
    phone: string;
    status: $Enums.UserStatus;
    updatedAt: Date;
    salary: number;
  } = {
    name: data.name,
    email: data.email,
    role: data.role,
    phone: data.phone,
    status: data.status,
    updatedAt: new Date(),
    salary: data.salary,
  };

  if (data.password) {
    payload.password = hashedPassword;
  }

  try {
    const updateUser = await prisma.user.update({
      where: { id },
      data: payload,
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

/**
 * Fetch a single user by ID with all profile information
 * @param userId the user ID to fetch
 * @returns user object with all profile fields
 */
export const fetchUserById = async (userId: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        isDeleted: false,
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
        isDeleted: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch {
    throw new Error('Failed to fetch user profile');
  }
};

/**
 * Update user profile information
 * @param userId the user ID to update
 * @param data the profile data to update
 * @returns updated user object
 */
export const updateUserProfile = async (
  userId: number,
  data: {
    name?: string;
    phone?: string;
    whatsapp?: string;
    bkashNumber?: string;
    nagadNumber?: string;
    bankAccountNumber?: string;
    branchName?: string;
    bankName?: string;
    swiftCode?: string;
    password?: string;
  }
) => {
  try {
    const updateData: {
      updatedAt: Date;
      name?: string;
      phone?: string;
      whatsapp?: string;
      bkashNumber?: string;
      nagadNumber?: string;
      bankAccountNumber?: string;
      branchName?: string;
      bankName?: string;
      swiftCode?: string;
      password?: string;
    } = {
      updatedAt: new Date(),
    };

    // Add fields to update data if they exist
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp;
    if (data.bkashNumber !== undefined)
      updateData.bkashNumber = data.bkashNumber;
    if (data.nagadNumber !== undefined)
      updateData.nagadNumber = data.nagadNumber;
    if (data.bankAccountNumber !== undefined)
      updateData.bankAccountNumber = data.bankAccountNumber;
    if (data.branchName !== undefined) updateData.branchName = data.branchName;
    if (data.bankName !== undefined) updateData.bankName = data.bankName;
    if (data.swiftCode !== undefined) updateData.swiftCode = data.swiftCode;

    // Handle password update separately (hash it)
    if (data.password && data.password !== '********') {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
        isDeleted: false,
      },
      data: updateData,
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
        isDeleted: true,
      },
    });

    return {
      ...updatedUser,
      message: 'Profile updated successfully',
    };
  } catch {
    throw new Error('Failed to update user profile');
  }
};
