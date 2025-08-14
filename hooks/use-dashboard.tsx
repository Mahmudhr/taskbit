'use client';

import getAllDashboardData from '@/server/dashboard/dashboard';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export function useDashboard() {
  const fetchDashboardMutation = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await getAllDashboardData();
      return res;
    },
    placeholderData: keepPreviousData,
  });
  return {
    fetchDashboardMutation,
    fetchDashboardMutationData: fetchDashboardMutation.data,
  };
}
