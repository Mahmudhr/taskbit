import { $Enums } from '@prisma/client';

// Types
export type UserType = {
  id: number;
  name: string;
  email: string;
  password?: string;
  phone: string | null;
  whatsapp: string | null;
  bkashNumber: string | null;
  nagadNumber: string | null;
  bankAccountNumber: string | null;
  branchName: string | null;
  bankName: string | null;
  swiftCode: string | null;
  role: $Enums.Role;
  status: $Enums.UserStatus;
  createdAt?: Date;
  updatedAt?: Date;
  tasks?: TaskType[];
  createdTasks?: TaskType[];
  payments?: FlatPaymentType[]; // Use the flat payment type
};

export type TaskType = {
  id: number;
  title: string;
  description?: string | null;
  link?: string | null;
  amount: number;
  status: $Enums.TaskStatus;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  assignedToId?: number | null;
  duration: Date | null;
  createdById?: number | null;
  assignedTo?: {
    name: string;
    email: string;
  } | null;
};

export type PaymentTypes = {
  id: number;
  referenceNumber: string;
  paymentType: $Enums.PaymentType;
  amount: number;
  status: $Enums.PaymentStatus;
  createdAt: Date;
  taskId: number;
  userId: number;
  user: {
    name: string;
    email: string;
  };
  task: {
    title: string;
    assignedTo: {
      email: string;
      name: string;
    } | null;
  };
};

export type FlatPaymentType = {
  id: number;
  referenceNumber: string;
  paymentType: $Enums.PaymentType;
  amount: number;
  status: $Enums.PaymentStatus;
  createdAt: Date;
  taskId: number;
  userId: number;
};

export interface Response<X, Y> {
  data: X;
  meta: Y;
}

export interface Meta {
  count: number;
  limit: number;
  page: number;
  totalPages: number;
}

// export interface UsersTasks {}
