import {
  fetchTasksByUserEmail,
  updateUserTaskDelivery,
} from '@/server/tasks/tasks';
import { UpdateUserTaskDeliveryType } from '@/server/types/tasks-type';
import { Meta, Response, UserTaskType } from '@/types/common';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export function useUserTask(email?: string, options?: string) {
  const queryClient = useQueryClient();

  const fetchUserTasksMutation = useQuery<Response<UserTaskType[], Meta>>({
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

  const updateUserTaskDeliveryMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateUserTaskDeliveryType;
    }) => updateUserTaskDelivery(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-tasks'] });
    },
  });

  return {
    fetchUserTasksMutation,
    fetchUserTasks: fetchUserTasksMutation.data,
    updateUserTaskDeliveryMutation,
    updateUserTaskDeliveryMutationAsync:
      updateUserTaskDeliveryMutation.mutateAsync,
  };
}
