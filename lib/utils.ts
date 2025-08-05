import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getErrorMessage = (error: unknown) => {
  let message;

  if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = String(error.message);
  } else if (typeof error === 'string') {
    message = error;
  } else {
    message = 'Something went wrong';
  }

  return message;
};

export function generateQueryString(params: Record<string, string>) {
  const isEmpty = Object.values(params).every((value) => value === '');

  if (isEmpty) {
    return '';
  }

  const queryString = Object.entries(params)
    .filter(([, value]) => value !== '')
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(
          value as unknown as string
        )}`
    )
    .join('&');

  return `?${queryString}`;
}

export function formatDateDMY(dateString: string) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export const roleConvert = {
  ADMIN: 'Admin',
  USER: 'User',
};

export const userStatusConvert = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

export const taskStatusConvert = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  SUBMITTED: 'Submitted',
  COMPLETED: 'Completed',
};

export const paymentStatusConvert = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
};

export const paymentTypeConvert = {
  BKASH: 'BKash',
  NAGAD: 'Nagad',
  BANK_TRANSFER: 'Bank Transfer',
};

export const paperTypeConvert = {
  CONFERENCE: 'Conference',
  SURVEY: 'Survey',
  JOURNAL: 'Journal',
};

export const formatDateToString = (date: Date | null | undefined): string => {
  if (!date) return '';
  return date.toISOString().split('T')[0]; // Converts Date to YYYY-MM-DD
};

export const salaryStatusConvert = {
  PENDING: 'Pending',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
} as const;

export const salaryTypeConvert = {
  MONTHLY: 'Monthly Salary',
  BONUS: 'Bonus',
  OVERTIME: 'Overtime',
  DEDUCTION: 'Deduction',
} as const;
