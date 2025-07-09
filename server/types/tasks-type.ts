import { $Enums } from '@prisma/client';

export type CreateTaskType = {
  title: string;
  description?: string;
  amount: number;
  status: $Enums.TaskStatus;
  assignedToId: string;
  duration: Date;
};
