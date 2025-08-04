'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSalary,
  updateSalary,
  fetchAllSalaries,
  fetchUserAllSalaries,
  fetchUserSalariesByEmail,
  deleteSalary,
} from '@/server/salary/salary';

export function useSalary() {
  const queryClient = useQueryClient();

  const createSalaryMutationAsync = useMutation({
    mutationFn: createSalary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
      queryClient.invalidateQueries({ queryKey: ['user-salaries'] });
      queryClient.invalidateQueries({ queryKey: ['user-salaries-by-email'] });
    },
  });

  const updateSalaryMutationAsync = useMutation({
    mutationFn: updateSalary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
      queryClient.invalidateQueries({ queryKey: ['user-salaries'] });
      queryClient.invalidateQueries({ queryKey: ['user-salaries-by-email'] });
    },
  });

  const deleteSalaryMutationAsync = useMutation({
    mutationFn: deleteSalary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
      queryClient.invalidateQueries({ queryKey: ['user-salaries'] });
      queryClient.invalidateQueries({ queryKey: ['user-salaries-by-email'] });
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

export function useFetchUserSalaries(userId: string, searchParams?: string) {
  return useQuery({
    queryKey: ['user-salaries', userId, searchParams],
    queryFn: () => fetchUserAllSalaries(userId, searchParams),
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
    },
  });
}
