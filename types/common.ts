import { $Enums } from '@prisma/client';

// Types

export type SalaryType = {
  id: number;
  userId?: number;
  amount: number;
  month: number;
  year: number;
  status: $Enums.SalaryStatus;
  salaryType: $Enums.SalaryType;
  paymentType: $Enums.PaymentType;
  referenceNumber: string | null;
  note?: string | null;
  createdAt: Date;
  updatedAt?: Date;
  // user: UserType;
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
  salary: number | null;
  salaries: {
    id: number; // changed from string
    month: number;
    year: number;
    amount: number;
    referenceNumber: string | null; // also your query can return null
    salaryType: $Enums.SalaryType;
    paymentType: $Enums.PaymentType;
    status: $Enums.SalaryStatus;
    createdAt: Date;
  }[];
};

export type TaskType = {
  id: number;
  title: string;
  description?: string | null;
  note?: string | null;
  link?: string | null;
  amount: number;
  status: $Enums.TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  duration: Date | null;
  createdById?: number | null;
  clientId?: number | null;
  paper_type: $Enums.PaperType;
  paid?: number;
  target_date: Date | null;
  client?: {
    id: number;
    name: string;
    email: string | null;
  } | null;

  payments: FlatPaymentType[];
  startDate?: Date | null;
  assignedUsers:
    | {
        id: number;
        name: string;
        email: string;
      }[];
  receivableAmounts: ReceivableAmountType[];
  receivable: number;
};

export type UserTaskType = {
  id: number;
  title: string;
  description?: string | null;
  note?: string | null;
  link?: string | null;
  status: $Enums.TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  assignedToId?: number | null;
  duration: Date | null;
  paper_type: $Enums.PaperType;
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

export interface ExpensesType {
  id: number;
  title: string;
  amount: number;
  createdAt: Date;
  updatedAt?: Date;
}
export interface ExpenseCalculationType {
  totalExpenses: number;
  totalAmount: number;
  averageAmount: number;
}

export interface SalaryCalculationType {
  totalSalaries: number;
  paidCount: number;
  pendingCount: number;
  cancelledCount: number;
  totalAmount: number;
  averageAmount: number;
  paidPercentage: number;
  pendingPercentage: number;
  cancelledPercentage: number;
}

export interface TaskCalculationsType {
  totalTasks: number;
  completedCount: number;
  completedPercentage: number;
  inProgressCount: number;
  inProgressPercentage: number;
  pendingCount: number;
  pendingPercentage: number;
}

export type PaymentCalculationsType = Record<
  | 'completedCount'
  | 'completedPercentage'
  | 'failedCount'
  | 'failedPercentage'
  | 'pendingCount'
  | 'pendingPercentage'
  | 'totalAllAmount'
  | 'totalCompletedAmount'
  | 'totalFailedAmount'
  | 'totalPayments'
  | 'totalPendingAmount',
  number
>;

export type ReceivableAmountType = {
  id: number;
  amount: number;
  status: $Enums.PaymentStatus | null;
};

export type TaskCalculationSummary = {
  paidAmount: number;
  paidTaskCount: number;
  receivableAmount: number;
  totalAmount: number;
  totalTaskCount: number;
};
