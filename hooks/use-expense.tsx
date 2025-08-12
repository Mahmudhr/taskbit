import {
  createExpense,
  deleteExpense,
  fetchAllExpenseCalculation,
  fetchAllExpenses,
  updateExpense,
} from '@/server/expense/expense';
import { ExpenseCalculationType } from '@/types/common';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useExpenses() {
  const queryClient = useQueryClient();

  const createExpenseMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['user-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-calculation'] });
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: updateExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['user-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-calculation'] });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['user-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-calculation'] });
    },
  });

  return {
    createExpenseMutation,
    updateExpenseMutation,
    deleteExpenseMutation,
    createExpenseMutationAsync: createExpenseMutation.mutateAsync,
    updateExpenseMutationAsync: updateExpenseMutation.mutateAsync,
    deleteExpenseMutationAsync: deleteExpenseMutation.mutateAsync,
  };
}

export function useFetchAllExpenses(searchParams?: string) {
  return useQuery({
    queryKey: ['expenses', searchParams],
    queryFn: () => fetchAllExpenses(searchParams),
  });
}

export const useFetchExpenseCalculation = (searchParams?: string) => {
  return useQuery<{ data: ExpenseCalculationType }>({
    queryKey: ['expense-calculation', searchParams],
    queryFn: () => fetchAllExpenseCalculation(searchParams),
  });
};
