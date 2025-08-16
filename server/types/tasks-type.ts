import { $Enums } from '@prisma/client';

export type CreateTaskType = {
  title: string;
  description?: string;
  amount: number;
  status: $Enums.TaskStatus;
  clientId?: number;
  duration: Date;
  paper_type: $Enums.PaperType;
  updatedAt?: Date;
  startDate?: Date | null;
  assignedUserIds?: number[];
  targetDate?: Date | null;
};

export type UpdateUserTaskDeliveryType = {
  title?: string;
  note?: string | null;
  link?: string | null;
  status: $Enums.TaskStatus;
};
