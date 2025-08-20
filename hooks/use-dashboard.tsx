'use client';

import getAllDashboardData from '@/server/dashboard/dashboard';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export function useDashboard(option?: string) {
  const fetchDashboardMutation = useQuery({
    queryKey: ['dashboard', option],
    queryFn: async () => {
      const res = await getAllDashboardData(option);
      return res;
    },
    placeholderData: keepPreviousData,
  });
  return {
    fetchDashboardMutation,
    fetchDashboardMutationData: fetchDashboardMutation.data,
  };
}
