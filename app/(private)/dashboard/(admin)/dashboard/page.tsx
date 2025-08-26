'use client';

import { useDashboard } from '@/hooks/use-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  ListFilter,
  ArrowDownLeft,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Modal from '@/components/modal';
import DashboardFilter from '@/components/filters/dashboard-filter';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateQueryString } from '@/lib/utils';

// Updated formatCurrency function with Bangladeshi Taka
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
  })
    .format(amount)
    .replace('BDT', '৳');
};

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [openFilter, setOpenFilter] = useState(false);

  const [params, setParams] = useState({
    month: searchParams.get('month') || '',
    year: searchParams.get('year') || '',
  });

  const queryString = generateQueryString(params);

  useEffect(() => {
    router.push(queryString);
  }, [queryString, router]);

  const {
    fetchDashboardMutationData,
    fetchDashboardCalcMutationData,
    fetchDashboardCalcMutation,
  } = useDashboard(queryString);

  if (
    !fetchDashboardMutationData?.data ||
    fetchDashboardCalcMutation.isLoading
  ) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
          <p className='mt-2 text-muted-foreground'>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const { financial, payments, expenses, salaries, counts, insights, recent } =
    fetchDashboardMutationData.data;

  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div className='flex flex-col md:flex-row gap-4 items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
          <p className='text-muted-foreground'>
            Overview of your business performance
          </p>
        </div>
        <Button
          onClick={() => setOpenFilter(true)}
          className='w-full sm:w-auto'
        >
          <ListFilter /> Filter
        </Button>
      </div>

      {/* Financial Summary Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Tasks Amounts
            </CardTitle>
            <TrendingUp className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {formatCurrency(fetchDashboardCalcMutationData?.totalPrice || 0)}
            </div>
            {/* <p className='text-xs text-muted-foreground'>
              From {counts.payments.completed} completed payments
            </p> */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Received
            </CardTitle>
            <ArrowDownLeft className='h-4 w-4 text-blue-600 dark:text-blue-400' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
              {formatCurrency(fetchDashboardCalcMutationData?.received || 0)}
            </div>
            {/* <p className='text-xs text-muted-foreground'>Expenses + Salaries</p> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Due</CardTitle>
            <TrendingDown className='h-4 w-4 dark:text-yellow-500 text-yellow-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold dark:text-yellow-500 text-yellow-600'>
              {formatCurrency(fetchDashboardCalcMutationData?.due || 0)}
            </div>
            {/* <p className='text-xs text-muted-foreground'>
              From {counts.payments.completed} completed payments
            </p> */}
          </CardContent>
        </Card>
        {/* <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Due</CardTitle>
            {financial.netProfit >= 0 ? (
              <ArrowUpRight className='h-4 w-4 text-green-600' />
            ) : (
              <ArrowDownRight className='h-4 w-4 text-red-600' />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                financial.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(financial.netProfit)}
            </div>
            <p className='text-xs text-muted-foreground'>
              Profit Margin: {financial.profitMargin}%
            </p>
          </CardContent>
        </Card> */}

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Expenses
            </CardTitle>
            <TrendingUp className='h-4 w-4 text-red-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {formatCurrency(fetchDashboardCalcMutationData?.expense || 0)}
            </div>
            {/* <p className='text-xs text-muted-foreground'>
              From {counts.payments.completed} completed payments
            </p> */}
          </CardContent>
        </Card>
      </div>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Net Income</CardTitle>
            <TrendingUp className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            {fetchDashboardCalcMutationData?.netIncome &&
            fetchDashboardCalcMutationData?.netIncome > 0 ? (
              <div className='text-2xl font-bold text-green-600'>
                {formatCurrency(fetchDashboardCalcMutationData?.netIncome || 0)}
              </div>
            ) : (
              <div className='text-2xl font-bold text-red-600'>
                {formatCurrency(fetchDashboardCalcMutationData?.netIncome || 0)}
              </div>
            )}
            {/* <p className='text-xs text-muted-foreground'>
              From {counts.payments.completed} completed payments
            </p> */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Received
            </CardTitle>
            <ArrowDownLeft className='h-4 w-4 text-blue-600 dark:text-blue-400' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
              {formatCurrency(fetchDashboardCalcMutationData?.received || 0)}
            </div>
            {/* <p className='text-xs text-muted-foreground'>Expenses + Salaries</p> */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Expenses
            </CardTitle>
            <TrendingUp className='h-4 w-4 text-red-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {formatCurrency(fetchDashboardCalcMutationData?.expense || 0)}
            </div>
            {/* <p className='text-xs text-muted-foreground'>
              From {counts.payments.completed} completed payments
            </p> */}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className='grid gap-4 md:grid-cols-2'>
        {/* Payment Stats */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CreditCard className='h-5 w-5' />
              Payment Overview
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-sm'>Total Payments</span>
                <span className='font-medium'>{counts.payments.total}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm'>Total Amount</span>
                <span className='font-medium'>
                  {formatCurrency(payments.total)}
                </span>
              </div>
            </div>

            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4 text-green-600' />
                  <span className='text-sm'>Completed</span>
                </div>
                <div className='text-right'>
                  <div className='font-medium text-green-600'>
                    {formatCurrency(payments.completed)}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {counts.payments.completed} payments
                  </div>
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Clock className='h-4 w-4 text-yellow-600' />
                  <span className='text-sm'>Pending</span>
                </div>
                <div className='text-right'>
                  <div className='font-medium text-yellow-600'>
                    {formatCurrency(payments.pending)}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {counts.payments.pending} payments
                  </div>
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <XCircle className='h-4 w-4 text-red-600' />
                  <span className='text-sm'>Failed</span>
                </div>
                <div className='text-right'>
                  <div className='font-medium text-red-600'>
                    {formatCurrency(payments.failed)}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {counts.payments.failed} payments
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expense Stats */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Receipt className='h-5 w-5' />
              Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-sm'>Total Expenses</span>
                <span className='font-medium'>{counts.expenses.total}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm'>Total Amount</span>
                <span className='font-medium text-red-600'>
                  {formatCurrency(expenses.total)}
                </span>
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>% of Income</span>
                <span className='font-medium'>
                  {insights.expensePercentage}%
                </span>
              </div>
              <Progress
                value={Math.min(insights.expensePercentage, 100)}
                className='h-2'
              />
            </div>

            {insights.expensePercentage > 100 && (
              <div className='flex items-center gap-2 text-red-600 text-sm'>
                <AlertTriangle className='h-4 w-4' />
                <span>Expenses exceed income!</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className='grid gap-4 md:grid-cols-2'>
        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {recent.payments.slice(0, 5).map((payment) => (
                <div
                  key={payment.id}
                  className='flex items-center justify-between gap-3'
                >
                  <div className='space-y-1'>
                    <p className='text-sm font-medium break-all'>
                      {payment.task.title}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {payment.user.name}
                    </p>
                  </div>
                  <div className='text-right'>
                    <div className='font-medium'>
                      {formatCurrency(payment.amount)}
                    </div>
                    <Badge
                      variant={
                        payment.status === 'COMPLETED'
                          ? 'default'
                          : payment.status === 'PENDING'
                          ? 'secondary'
                          : 'destructive'
                      }
                      className='text-xs'
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {recent.expenses.slice(0, 5).map((expense) => (
                <div
                  key={expense.id}
                  className='flex items-center justify-between'
                >
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>{expense.title}</p>
                    <p className='text-xs text-muted-foreground'>
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className='font-medium text-red-600'>
                    {formatCurrency(expense.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Health Alert */}
      {financial.netProfit < 0 && (
        <Card className='border-red-200 bg-red-50'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-red-700'>
              <AlertTriangle className='h-5 w-5' />
              Business Health Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-red-700'>
              Your business is currently operating at a loss of{' '}
              {formatCurrency(Math.abs(financial.netProfit))}. Consider
              reviewing your expenses and increasing revenue streams.
            </p>
            <div className='mt-3 space-y-1 text-sm text-red-600'>
              <p>
                • Expenses: {formatCurrency(expenses.total)} (
                {insights.expensePercentage}% of income)
              </p>
              <p>
                • Salaries: {formatCurrency(salaries.paid)} (
                {insights.salaryPercentage}% of income)
              </p>
              <p>• Total outgoing: {formatCurrency(financial.totalOutgoing)}</p>
            </div>
          </CardContent>
        </Card>
      )}
      <Modal
        isOpen={openFilter}
        setIsOpen={setOpenFilter}
        title='Filter Salary'
        description=' '
      >
        <DashboardFilter
          setParams={setParams}
          params={params}
          setOpenFilter={setOpenFilter}
        />
      </Modal>
    </div>
  );
}
