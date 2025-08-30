export type CreateEmployeeOfTheMonthType = {
  year: number;
  month: number;
  description?: string | undefined;

  assignedToId: number;
};
