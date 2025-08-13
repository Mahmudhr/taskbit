import {
  createTasks,
  deleteTask,
  fetchAllTaskCalculation,
  fetchAllTasks,
  updateTask,
} from '@/server/tasks/tasks';
import { CreateTaskType } from '@/server/types/tasks-type';
import { Meta, Response, TaskCalculationsType, TaskType } from '@/types/common';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
// import { createTask } from '../server/user/user';

export function useTask(options?: string) {
  const queryClient = useQueryClient();
  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTaskType) => createTasks(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-calculation'] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateTaskType }) =>
      updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-calculation'] });
    },
  });

  const fetchTasksMutation = useQuery<Response<TaskType[], Meta>>({
    queryKey: ['tasks', options],
    queryFn: async () => {
      const res = await fetchAllTasks(options);
      return res;
    },
    placeholderData: keepPreviousData,
  });

  const fetchTasksCalculationMutation = useQuery<TaskCalculationsType>({
    queryKey: ['tasks-calculation', options],
    queryFn: async () => {
      const res = await fetchAllTaskCalculation(options);
      return res;
    },
    placeholderData: keepPreviousData,
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-calculation'] });
    },
  });

  return {
    createTaskMutation,
    createTaskMutationAsync: createTaskMutation.mutateAsync,
    updateTaskMutation,
    updateTaskMutationAsync: updateTaskMutation.mutateAsync,
    fetchTasksMutation,
    fetchTasks: fetchTasksMutation.data,
    fetchTasksCalculationMutation,
    fetchTasksCalculation: fetchTasksCalculationMutation.data,
    deleteTask: deleteTaskMutation.mutate,
    deleteTaskAsync: deleteTaskMutation.mutateAsync,
  };
}
