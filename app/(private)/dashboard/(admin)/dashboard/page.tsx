import DashboardPage from '@/components/pages/dashboard/dashboard-page';
import { getQueryClient } from '@/lib/react-query';
import { currentMonth, generateQueryString } from '@/lib/utils';
import { getAllDashboardData } from '@/server/dashboard/dashboard';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

export default async function DashboardMainPage({
  searchParams,
}: {
  searchParams:
    | { year?: string; month?: string }
    | Promise<{ year?: string; month?: string }>;
}) {
  const resolvedParams = await searchParams;
  const month = resolvedParams?.month || '';
  const year = resolvedParams?.year || '';

  const params = { month, year };
  const queryString = generateQueryString(params);

  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['dashboard', queryString],
      queryFn: () => getAllDashboardData(queryString),
    }),
    queryClient.prefetchQuery({
      queryKey: ['dashboard', `?month=${currentMonth}`],
      queryFn: () => getAllDashboardData(`?month=${currentMonth}`),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardPage />
    </HydrationBoundary>
  );
}
