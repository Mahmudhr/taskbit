import { $Enums } from '@prisma/client';

export type CreateTaskType = {
  title: string;
  description?: string;
  amount: number;
  status: $Enums.TaskStatus;
  assignedToId: string;
  clientId: string;
  duration: Date;
  paper_type: $Enums.PaperType;
};
