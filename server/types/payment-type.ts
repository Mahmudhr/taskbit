import { $Enums } from '@prisma/client';

export type CreatePayment = {
  paymentType: $Enums.PaymentType;
  referenceNumber: string;
  amount: number;
  status: $Enums.PaymentStatus;
  userId: string;
  taskId: number;
};
