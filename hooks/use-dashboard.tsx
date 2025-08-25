'use client';

import {
  getAllDashboardCalc,
  getAllDashboardData,
} from '@/server/dashboard/dashboard';
import { DashboardAllCalcType } from '@/types/common';
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

  const fetchDashboardCalcMutation = useQuery<DashboardAllCalcType>({
    queryKey: ['dashboard-calc', option],
    queryFn: async () => {
      const res = await getAllDashboardCalc(option);
      return res;
    },
    placeholderData: keepPreviousData,
  });

  return {
    fetchDashboardMutation,
    fetchDashboardMutationData: fetchDashboardMutation.data,
    fetchDashboardCalcMutation,
    fetchDashboardCalcMutationData: fetchDashboardCalcMutation.data,
  };
}
