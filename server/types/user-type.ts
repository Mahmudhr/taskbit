export type CreateUserType = {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: 'ADMIN' | 'USER' | 'EMPLOYEE' | 'CO_ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  salary: number;
};
