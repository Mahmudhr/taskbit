import { createTasks, fetchAllTasks } from '@/server/tasks/tasks';
import { CreateTaskType } from '@/server/types/tasks-type';
import { Meta, Response, TaskType } from '@/types/common';
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

  return {
    createTaskMutation,
    createTaskMutationAsync: createTaskMutation.mutateAsync,
    fetchTasksMutation,
    fetchTasks: fetchTasksMutation.data,
  };
}
