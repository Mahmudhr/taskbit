import { fetchTasksByUserEmail } from '@/server/tasks/tasks';
import { Meta, Response, TaskType } from '@/types/common';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export function useUserTask(email?: string, options?: string) {
  // Fetch tasks assigned to a user (with filters)
  const fetchUserTasksMutation = useQuery<Response<TaskType[], Meta>>({
    queryKey: ['user-tasks', email, options],
    queryFn: async () => {
      if (!email)
        return {
          data: [],
          meta: { count: 0, page: 1, limit: 10, totalPages: 1 },
        };
      return fetchTasksByUserEmail(email, options);
    },
    enabled: !!email,
    placeholderData: keepPreviousData,
  });

  return {
    fetchUserTasksMutation,
    fetchUserTasks: fetchUserTasksMutation.data,
  };
}
