// Enums
export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  COMPLETED = 'COMPLETED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum PaymentType {
  BKASH = 'BKASH',
  NAGAD = 'NAGAD',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

// Types
export type UserType = {
  id: number;
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  whatsapp?: string | null;
  bkashNumber?: string | null;
  nagadNumber?: string | null;
  bankAccountNumber?: string | null;
  branchName?: string | null;
  bankName?: string | null;
  swiftCode?: string | null;
  role: Role;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  tasks?: TaskType[];
  createdTasks?: TaskType[];
  payments?: PaymentTypes[];
  isDelete: boolean;
};

export type TaskType = {
  id: number;
  title: string;
  description?: string | null;
  link?: string | null;
  amount: number;
  status: TaskStatus;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: UserType | null;
  assignedToId?: number | null;
  createdBy?: UserType | null;
  createdById?: number | null;
  payments: PaymentTypes[];
};

export type PaymentTypes = {
  id: number;
  referenceNumber: string;
  paymentType: PaymentType;
  amount: number;
  status: PaymentStatus;
  createdAt: Date;
  task: TaskType;
  taskId: number;
  user: TaskType;
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
