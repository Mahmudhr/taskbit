import { $Enums } from '@prisma/client';

// Types

export type SalaryType = {
  id: number;
  userId: number;
  amount: number;
  month: number;
  year: number;
  status: $Enums.SalaryStatus;
  salaryType: $Enums.SalaryType;
  paymentType: $Enums.PaymentType;
  referenceNumber?: string | null;
  note?: string | null;
  createdAt: Date;
  updatedAt?: Date;
};

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
  payments?: FlatPaymentType[];
  salaries: SalaryType[];
};

export type TaskType = {
  id: number;
  title: string;
  description?: string | null;
  note?: string | null;
  link?: string | null;
  amount: number;
  status: $Enums.TaskStatus;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  assignedToId?: number | null;
  duration: Date | null;
  createdById?: number | null;
  clientId?: number | null;
  paper_type: $Enums.PaperType;
  paid?: number;
  client?: {
    id: number;
    name: string;
    email: string | null;
  } | null;
  assignedTo?: {
    id: number;
    name: string;
    email: string;
  } | null;
  payments: FlatPaymentType[];
  startDate?: Date | null;
};

export type UserTaskType = {
  id: number;
  title: string;
  description?: string | null;
  note?: string | null;
  link?: string | null;
  amount: number;
  status: $Enums.TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  assignedToId?: number | null;
  duration: Date | null;
  paper_type: $Enums.PaperType;
  paid?: number;
  payments: FlatPaymentType[];
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

export interface ClientType {
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  status: $Enums.ClientStatus;
  createdAt?: Date;
  updatedAt?: Date;
  id: number;
  tasks?: TaskType[];
}
// export interface UsersTasks {}

export interface ClientSelectOption {
  id: number;
  name: string;
  email?: string | null;
}
