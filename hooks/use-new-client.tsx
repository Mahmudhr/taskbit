'use client';

import {
  createClientTasks,
  fetchClientTasksByUserEmail,
} from '@/server/client-tasks/client-tasks';
import { CreateNewClientTaskType } from '@/server/types/client-type';
import { ClientTaskType, Meta, Response } from '@/types/common';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export function useNewClientTasks() {
  const queryClient = useQueryClient();
  const createClientTaskMutation = useMutation({
    mutationFn: async (data: CreateNewClientTaskType) => {
      const result = await createClientTasks(data);
      if (!result.success) {
        throw new Error(result.message || 'Failed to create task');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-tasks'] });
    },
  });

  return {
    createClientTaskMutation,
    createClientTaskMutationAsync: createClientTaskMutation.mutateAsync,
  };
}

export function useGetNewClientTasks(email?: string, options?: string) {
  //   const queryClient = useQueryClient();
  const fetchClientTasksMutation = useQuery<Response<ClientTaskType[], Meta>>({
    queryKey: ['client-tasks', email, options],
    queryFn: async () => {
      if (!email)
        return {
          data: [],
          meta: { count: 0, page: 1, limit: 10, totalPages: 1 },
        };
      return fetchClientTasksByUserEmail(email, options);
    },
    enabled: !!email,
    placeholderData: keepPreviousData,
  });
  return {
    fetchClientTasksMutation,
    fetchClientTasks: fetchClientTasksMutation.data,
  };
}
