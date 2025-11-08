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

export type CreateNewClientTaskType = {
  id?: number;
  title: string;
  description?: string;
  amount: number;
  status: $Enums.TaskStatus;
  createdById?: number;
  duration?: Date | null | undefined;
  paper_type: $Enums.PaperType;
  updatedAt?: Date;
  unique_id?: string;
  correction_description?: string;
  task_type: 'REGULAR' | 'URGENT' | 'CORRECTION';
};
