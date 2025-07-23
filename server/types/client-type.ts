import { $Enums } from '@prisma/client';

export type CreateClientType = {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: $Enums.ClientStatus;
};
