'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSalary,
  updateSalary,
  fetchAllSalaries,
  fetchUserAllSalaries,
  fetchUserSalariesByEmail,
  deleteSalary,
  fetchAllSalariesCalculation,
  fetchUserAllSalariesCalculation,
} from '@/server/salary/salary';
import { SalaryCalculationType } from '@/types/common';
import { PaymentType, SalaryStatus, SalaryType } from '@prisma/client';
import { currentMonth } from '@/lib/utils';

type CreateSalaryType = {
  amount: number;
  month: number;
  year: number;
  status: SalaryStatus;
  salaryType: SalaryType;
  paymentType: PaymentType;
  referenceNumber?: string;
  note?: string;
  userId: string;
};

export function useSalary() {
  const queryClient = useQueryClient();

  const createSalaryMutationAsync = useMutation({
    mutationFn: async (data: CreateSalaryType) => {
      const result = await createSalary(data);
      if (!result.success) {
        throw new Error(result.message || 'Failed to create salary');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-salaries'] });
      queryClient.invalidateQueries({ queryKey: ['user-salaries-by-email'] });
      queryClient.invalidateQueries({ queryKey: ['salaries-calculations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', `?month=${currentMonth}`],
      });
    },
  });

  const updateSalaryMutationAsync = useMutation({
    mutationFn: updateSalary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-salaries'] });
      queryClient.invalidateQueries({ queryKey: ['user-salaries-by-email'] });
      queryClient.invalidateQueries({ queryKey: ['salaries-calculations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', `?month=${currentMonth}`],
      });
    },
  });

  const deleteSalaryMutationAsync = useMutation({
    mutationFn: deleteSalary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-salaries'] });
      queryClient.invalidateQueries({ queryKey: ['user-salaries-by-email'] });
      queryClient.invalidateQueries({ queryKey: ['salaries-calculations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', `?month=${currentMonth}`],
      });
    },
  });

  return {
    createSalaryMutationAsync: createSalaryMutationAsync.mutateAsync,
    updateSalaryMutationAsync: updateSalaryMutationAsync.mutateAsync,
    deleteSalaryMutationAsync: deleteSalaryMutationAsync.mutateAsync,
  };
}

export function useFetchAllSalaries(searchParams?: string) {
  return useQuery({
    queryKey: ['salaries', searchParams],
    queryFn: () => fetchAllSalaries(searchParams),
  });
}

export function useFetchUserSalaries(userId?: string, searchParams?: string) {
  return useQuery({
    queryKey: ['user-salaries', userId, searchParams],
    queryFn: () => fetchUserAllSalaries(userId, searchParams),
    enabled: !!userId,
  });
}

export function useFetchUserSalariesCalculations(
  userId?: string,
  searchParams?: string
) {
  return useQuery({
    queryKey: ['user-salaries-calculations', userId, searchParams],
    queryFn: () => fetchUserAllSalariesCalculation(userId, searchParams),
    enabled: !!userId,
  });
}

export function useFetchUserSalariesByEmail(
  email: string,
  searchParams?: string
) {
  return useQuery({
    queryKey: ['user-salaries-by-email', email, searchParams],
    queryFn: () => fetchUserSalariesByEmail(email, searchParams),
    enabled: !!email,
  });
}

// Additional hooks for specific use cases
export function useCreateSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSalary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
      queryClient.invalidateQueries({ queryKey: ['user-salaries'] });
      queryClient.invalidateQueries({ queryKey: ['user-salaries-by-email'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', `?month=${currentMonth}`],
      });
    },
  });
}

export function useUpdateSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSalary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
      queryClient.invalidateQueries({ queryKey: ['user-salaries'] });
      queryClient.invalidateQueries({ queryKey: ['user-salaries-by-email'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', `?month=${currentMonth}`],
      });
    },
  });
}

export function useDeleteSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSalary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
      queryClient.invalidateQueries({ queryKey: ['user-salaries'] });
      queryClient.invalidateQueries({ queryKey: ['user-salaries-by-email'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', `?month=${currentMonth}`],
      });
    },
  });
}

export function useFetchAllSalariesCalculations(searchParams?: string) {
  return useQuery<{ data: SalaryCalculationType }>({
    queryKey: ['salaries-calculations', searchParams],
    queryFn: () => fetchAllSalariesCalculation(searchParams),
  });
}
