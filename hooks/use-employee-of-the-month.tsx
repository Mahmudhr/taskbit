'use client';

import {
  createEmployeeOfTheMonth,
  fetchAllEmployeesOfTheMonth,
} from '@/server/employee-of-the-month/employee-of-the-month';
import { CreateEmployeeOfTheMonthType } from '@/server/types/employee-of-the-month-type';
import { EmployeeOfTheMonthType, Meta, Response } from '@/types/common';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export default function useEmployeeOfTheMonth(option?: string) {
  const queryClient = useQueryClient();

  const createEmployeeOfTheMonthAsync = useMutation({
    mutationFn: async (data: CreateEmployeeOfTheMonthType) => {
      const result = await createEmployeeOfTheMonth(data);
      if (!result.success) {
        throw new Error(
          result.message || 'Failed to create employee of the month'
        );
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-of-the-month'] });
    },
  });

  const getAllEmployeesOfTheMonth = useQuery<
    Response<EmployeeOfTheMonthType[], Meta>
  >({
    queryKey: ['employee-of-the-month', option],
    queryFn: async () => {
      const result = await fetchAllEmployeesOfTheMonth(option);
      return result;
    },
  });

  return {
    createEmployeeOfTheMonthMutationAsync:
      createEmployeeOfTheMonthAsync.mutateAsync,
    getAllEmployeesOfTheMonthData: getAllEmployeesOfTheMonth.data,
    getAllEmployeesOfTheMonth,
  };
}
