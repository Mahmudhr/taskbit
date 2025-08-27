import { currentMonth } from '@/lib/utils';
import {
  createTasks,
  deleteTask,
  fetchAllTaskCalculation,
  fetchAllTasks,
  fetchAllTaskWithCalculation,
  updateTask,
} from '@/server/tasks/tasks';
import { CreateTaskType } from '@/server/types/tasks-type';
import {
  Meta,
  Response,
  TaskCalculationsType,
  TaskCalculationSummary,
  TaskType,
} from '@/types/common';
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
    mutationFn: async (data: CreateTaskType) => {
      const result = await createTasks(data);
      if (!result.success) {
        throw new Error(result.message || 'Failed to create task');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-calculation'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-calc'] });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', `?month=${currentMonth}`],
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CreateTaskType }) => {
      const result = await updateTask(id, data);
      if (!result.success) {
        throw new Error(result.message || 'Failed to update task');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-calculation'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-calc'] });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', `?month=${currentMonth}`],
      });
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
      queryClient.invalidateQueries({
        queryKey: ['dashboard', `?month=${currentMonth}`],
      });
    },
  });

  const fetchAllTaskWithCalcMutation = useQuery<TaskCalculationSummary>({
    queryKey: ['tasks-calc', options],
    queryFn: async () => {
      const res = await fetchAllTaskWithCalculation(options);
      return res;
    },
    placeholderData: keepPreviousData,
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
    fetchAllTaskWithCalcMutation,
    fetchAllTaskWithCalc: fetchAllTaskWithCalcMutation.data,
    deleteTask: deleteTaskMutation.mutate,
    deleteTaskAsync: deleteTaskMutation.mutateAsync,
  };
}
