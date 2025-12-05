'use client';

import DashboardPage from '@/components/pages/dashboard/dashboard-page';

export default function DashboardMainPage() {
  // const resolvedParams = await searchParams;
  // const month = resolvedParams?.month || '';
  // const year = resolvedParams?.year || '';

  // const params = { month, year };
  // const queryString = generateQueryString(params);

  // const queryClient = getQueryClient();

  // await Promise.all([
  //   queryClient.prefetchQuery({
  //     queryKey: ['dashboard', queryString],
  //     queryFn: () => getAllDashboardData(queryString),
  //   }),
  //   queryClient.prefetchQuery({
  //     queryKey: ['dashboard', `?month=${currentMonth}`],
  //     queryFn: () => getAllDashboardData(`?month=${currentMonth}`),
  //   }),
  // ]);

  return (
    // <HydrationBoundary state={dehydrate(queryClient)}>
    <DashboardPage />
    // </HydrationBoundary>
  );
}
