import { $Enums } from '@prisma/client';

export type CreateTaskType = {
  title: string;
  description?: string;
  amount: number;
  status: $Enums.TaskStatus;
  assignedToId: number;
  clientId?: number;
  duration: Date;
  paper_type: $Enums.PaperType;
  updatedAt?: Date;
};
