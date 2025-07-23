'use server';

import { prisma } from '@/prisma/db';
import { CreateClientType } from '../types/client-type';
import { $Enums } from '@prisma/client';

export const createClient = async (data: CreateClientType) => {
  try {
    const client = await prisma.client.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        company: data.company || null,
      },
    });
    return { success: true, message: 'Client created successfully', client };
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2002' &&
      'meta' in error &&
      error.meta &&
      typeof error.meta === 'object' &&
      'target' in error.meta &&
      Array.isArray(error.meta.target) &&
      error.meta.target.includes('email')
    ) {
      throw new Error('Email already exists');
    }
    throw new Error('Failed to create client');
  }
};

export const searchClients = async (query: string) => {
  if (!query || query.trim() === '') return [];
  try {
    const users = await prisma.client.findMany({
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

export const fetchAllClients = async (data?: string) => {
  const params = new URLSearchParams(data);
  const search = params.get('search') || '';
  const page = parseInt(params.get('page') ?? '1') || 1;
  const status = params.get('status');
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

    const count = await prisma.client.count({
      where: whereClause,
    });

    const totalPages = Math.ceil(count / limit);

    const users = await prisma.client.findMany({
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
        company: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        // tasks: {
        //   include: {
        //     payments: true,
        //   },
        // },
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
    throw new Error('Failed to load clients');
  }
};

export const updateClient = async ({
  data,
  id,
}: {
  data: CreateClientType;
  id: number;
}) => {
  try {
    // Build update data conditionally
    const updateData: {
      name: string;
      phone: string | null;
      status?: $Enums.ClientStatus;
      company: string | null;
      updatedAt: Date;
      email?: string;
    } = {
      name: data.name,
      phone: data.phone || null,
      company: data.company || null,
      updatedAt: new Date(),
    };

    // Only include status if it has a value
    if (data.status) {
      updateData.status = data.status;
    }

    // Only include email if it has a value
    if (data.email && data.email.trim() !== '') {
      updateData.email = data.email;
    }

    const updateUser = await prisma.client.update({
      where: { id },
      data: updateData,
    });
    return {
      ...updateUser,
      message: 'Client updated successfully',
    };
  } catch (e) {
    if (
      e &&
      typeof e === 'object' &&
      'code' in e &&
      e.code === 'P2002' &&
      'meta' in e &&
      e.meta &&
      typeof e.meta === 'object' &&
      'target' in e.meta &&
      Array.isArray(e.meta.target) &&
      e.meta.target.includes('email')
    ) {
      throw new Error('Email already in use');
    }
    throw new Error('Failed to update client');
  }
};

export async function deleteClient(id: number) {
  try {
    const updateUser = await prisma.client.update({
      where: { id },
      data: { isDeleted: true },
    });

    return updateUser;
  } catch {
    throw new Error('Failed to delete client');
  }
}
