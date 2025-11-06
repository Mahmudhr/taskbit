import { $Enums } from '@prisma/client';

export type CreateClientType = {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: $Enums.ClientStatus;
};

export type CreateNewClientType = {
  email: string;
  password: string;
  name: string;
  phone: string;
  // role: 'CLIENT';
  status: 'ACTIVE' | 'INACTIVE';
};
