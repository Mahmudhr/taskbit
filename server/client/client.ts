'use server';

import { prisma } from '@/prisma/db';

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
