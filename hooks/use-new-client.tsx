'use client';

import {
  createClientTasks,
  deleteClientTask,
  fetchClientTasks,
  fetchClientTasksByUserEmail,
  updateClientTasks,
  updateNewClientTasks,
} from '@/server/client-tasks/client-tasks';
import { CreateNewClientTaskType } from '@/server/types/client-type';
import {
  ClientTasksType,
  Meta,
  NewClientTasksType,
  Response,
} from '@/types/common';
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

  const updateClientTaskMutation = useMutation({
    mutationFn: async (data: CreateNewClientTaskType) => {
      const result = await updateClientTasks(data);
      if (!result.success) {
        throw new Error(result.message || 'Failed to create task');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-tasks'] });
    },
  });

  const updateNewClientTaskMutation = useMutation({
    mutationFn: async (data: CreateNewClientTaskType) => {
      const result = await updateNewClientTasks(data);
      if (!result.success) {
        throw new Error(result.message || 'Failed to create task');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-tasks'] });
    },
  });

  const deleteClientTaskMutation = useMutation({
    mutationFn: (id: number) => deleteClientTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-tasks'] });
    },
  });

  return {
    createClientTaskMutation,
    createClientTaskMutationAsync: createClientTaskMutation.mutateAsync,
    updateClientTaskMutation,
    updateClientTaskMutationAsync: updateClientTaskMutation.mutateAsync,
    updateNewClientTaskMutation,
    updateNewClientTaskMutationAsync: updateNewClientTaskMutation.mutateAsync,
    deleteClientTask: deleteClientTaskMutation.mutate,
    deleteClientTaskAsync: deleteClientTaskMutation.mutateAsync,
  };
}

export function useGetNewClientTasks(email?: string, options?: string) {
  const fetchClientTasksMutation = useQuery<Response<ClientTasksType[], Meta>>({
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

export function useFetchNewClientTasks(options?: string) {
  const fetchClientAllTasksMutation = useQuery<
    Response<NewClientTasksType[], Meta>
  >({
    queryKey: ['client-tasks', options],
    queryFn: async () => fetchClientTasks(options),
    placeholderData: keepPreviousData,
  });
  return {
    fetchClientAllTasksMutation,
    fetchClientAllTasks: fetchClientAllTasksMutation.data,
  };
}
