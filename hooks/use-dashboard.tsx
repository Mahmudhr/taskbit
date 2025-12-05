'use client';

import { currentMonth } from '@/lib/utils';
// import { getAllDashboardData } from '@/server/dashboard/dashboard';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

export function useDashboard(option?: string) {
  const fetchDashboardMutation = useQuery({
    queryKey: ['dashboard', option],
    queryFn: async () => {
      const url = '/api/all-dashboard' + (option || '');
      const res = await fetch(url).then((data) => data.json());
      return res;
    },
    placeholderData: keepPreviousData,
  });

  return {
    fetchDashboardMutation,
    fetchDashboardMutationData: fetchDashboardMutation.data,
  };
}

export function useCurrentDashboard(option?: string) {
  const fetchCurrentDashboardMutation = useQuery({
    queryKey: ['dashboard', `?month=${currentMonth}`],
    queryFn: async () => {
      const url = '/api/all-dashboard' + (option || `?month=${currentMonth}`);
      const res = await fetch(url).then((data) => data.json());
      return res;
    },
    placeholderData: keepPreviousData,
  });

  return {
    fetchCurrentDashboardMutation,
    fetchCurrentDashboardMutationData: fetchCurrentDashboardMutation.data,
  };
}
