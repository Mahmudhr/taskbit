'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  cn,
  salaryStatusConvert,
  salaryTypeConvert,
  paymentTypeConvert,
} from '@/lib/utils';
import { $Enums } from '@prisma/client';
import dayjs from 'dayjs';
import { SalaryType } from '@/types/common';

const getStatusBadge = (status: $Enums.SalaryStatus) => {
  const variants = {
    PENDING: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    PAID: 'bg-green-100 text-green-800 hover:bg-green-200',
    CANCELLED: 'bg-red-100 text-red-800 hover:bg-red-200',
  } as const;
  return (
    <Badge className={cn(variants[status])}>
      {salaryStatusConvert[status]}
    </Badge>
  );
};

const getSalaryTypeBadge = (type: $Enums.SalaryType) => {
  const variants = {
    MONTHLY: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    BONUS: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    OVERTIME: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  } as const;
  return (
    <Badge className={cn(variants[type])}>{salaryTypeConvert[type]}</Badge>
  );
};

const SalaryItem = ({ salary }: { salary: SalaryType }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`${fieldName} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <div className='p-4 border rounded-lg space-y-3'>
      {/* Salary Header */}
      <div className='flex flex-wrap gap-2 items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium'>Salary #{salary.id}</span>
          {getStatusBadge(salary.status)}
          {getSalaryTypeBadge(salary.salaryType)}
        </div>
        <span className='text-lg font-semibold text-green-600'>
          ৳ {salary.amount.toLocaleString()}
        </span>
      </div>

      {/* Salary Period */}
      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
        <span>Period:</span>
        <span className='font-medium'>
          {monthNames[salary.month - 1]} {salary.year}
        </span>
      </div>

      {/* Salary Details Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        {/* Payment Type */}
        <div className='flex items-center justify-between p-2 bg-muted rounded'>
          <div>
            <label className='text-xs font-medium text-muted-foreground'>
              Payment Method
            </label>
            <p className='text-sm'>
              {paymentTypeConvert[salary.paymentType] || salary.paymentType}
            </p>
          </div>
        </div>

        {/* Reference Number */}
        {salary.referenceNumber && (
          <div className='flex items-center justify-between p-2 bg-muted rounded'>
            <div className='flex-1'>
              <label className='text-xs font-medium text-muted-foreground'>
                Reference Number
              </label>
              <p className='text-sm'>{salary.referenceNumber}</p>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() =>
                handleCopy(salary.referenceNumber!, 'Reference Number')
              }
              className='h-6 w-6 p-0'
            >
              {copiedField === 'Reference Number' ? (
                <Check className='h-3 w-3 text-green-600' />
              ) : (
                <Copy className='h-3 w-3' />
              )}
            </Button>
          </div>
        )}

        {/* Created Date */}
        <div className='flex items-center justify-between p-2 bg-muted rounded'>
          <div>
            <label className='text-xs font-medium text-muted-foreground'>
              Entry Date
            </label>
            <p className='text-sm'>
              {dayjs(salary.createdAt).format('DD-MM-YYYY')}
            </p>
          </div>
        </div>

        {/* Created Time */}
        <div className='flex items-center justify-between p-2 bg-muted rounded'>
          <div>
            <label className='text-xs font-medium text-muted-foreground'>
              Entry Time
            </label>
            <p className='text-sm'>
              {dayjs(salary.createdAt).format('h:mm A')}
            </p>
          </div>
        </div>
      </div>

      {/* Note */}
      {salary.note && (
        <div className='p-2 bg-gray-50 rounded'>
          <label className='text-xs font-medium text-muted-foreground'>
            Note
          </label>
          <p className='text-sm mt-1'>{salary.note}</p>
        </div>
      )}
    </div>
  );
};

type SalaryDetailsProps = {
  salaries: SalaryType[];
  showUserInfo?: boolean;
};

export default function SalaryDetails({ salaries }: SalaryDetailsProps) {
  if (!salaries || salaries.length === 0) {
    return (
      <div className='text-center py-8'>
        <div className='text-muted-foreground'>
          <p className='text-lg font-medium'>No Salaries Found</p>
          <p className='text-sm'>No salary entries have been created yet.</p>
        </div>
      </div>
    );
  }

  // Calculate totals - simplified without deduction logic
  const totalPaid = salaries.reduce((sum, salary) => {
    return salary.status === 'PAID' ? sum + salary.amount : sum;
  }, 0);

  const totalPending = salaries.reduce((sum, salary) => {
    return salary.status === 'PENDING' ? sum + salary.amount : sum;
  }, 0);

  // Filter by status
  const paidSalaries = salaries.filter((s) => s.status === 'PAID');
  const pendingSalaries = salaries.filter((s) => s.status === 'PENDING');
  const cancelledSalaries = salaries.filter((s) => s.status === 'CANCELLED');

  // Filter by type - removed DEDUCTION
  const monthlySalaries = salaries.filter((s) => s.salaryType === 'MONTHLY');
  const bonusSalaries = salaries.filter((s) => s.salaryType === 'BONUS');
  const overtimeSalaries = salaries.filter((s) => s.salaryType === 'OVERTIME');

  return (
    <div className='space-y-6'>
      {/* Summary Cards - Updated to include all 5 metrics */}
      <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* Total Paid */}
        <div className='p-3 border rounded-lg text-center'>
          <div className='text-lg font-semibold text-green-600'>
            ৳ {totalPaid.toLocaleString()}
          </div>
          <div className='text-xs text-muted-foreground'>Total Paid</div>
        </div>

        {/* Total Pending */}
        <div className='p-3 border rounded-lg text-center'>
          <div className='text-lg font-semibold text-yellow-600'>
            ৳ {totalPending.toLocaleString()}
          </div>
          <div className='text-xs text-muted-foreground'>Total Pending</div>
        </div>

        {/* Paid Count */}
        <div className='p-3 border rounded-lg text-center'>
          <div className='text-lg font-semibold text-green-600'>
            {paidSalaries.length}
          </div>
          <div className='text-xs text-muted-foreground'>Paid Entries</div>
        </div>

        {/* Pending Count */}
        <div className='p-3 border rounded-lg text-center'>
          <div className='text-lg font-semibold text-yellow-600'>
            {pendingSalaries.length}
          </div>
          <div className='text-xs text-muted-foreground'>Pending Entries</div>
        </div>
      </div>

      {/* Status Breakdown - Alternative layout showing all status counts */}
      <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
        <div className='p-3 border rounded-lg text-center'>
          <div className='text-lg font-semibold text-green-600'>
            {paidSalaries.length}
          </div>
          <div className='text-xs text-muted-foreground'>Paid Salaries</div>
          <div className='text-sm font-medium text-green-600'>
            ৳ {totalPaid.toLocaleString()}
          </div>
        </div>
        <div className='p-3 border rounded-lg text-center'>
          <div className='text-lg font-semibold text-yellow-600'>
            {pendingSalaries.length}
          </div>
          <div className='text-xs text-muted-foreground'>Pending Salaries</div>
          <div className='text-sm font-medium text-yellow-600'>
            ৳ {totalPending.toLocaleString()}
          </div>
        </div>
        <div className='p-3 border rounded-lg text-center'>
          <div className='text-lg font-semibold text-red-600'>
            {cancelledSalaries.length}
          </div>
          <div className='text-xs text-muted-foreground'>
            Cancelled Salaries
          </div>
        </div>
      </div>

      {/* Type Summary */}
      <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
        <div className='p-3 border rounded-lg text-center'>
          <div className='text-lg font-semibold text-blue-600'>
            {monthlySalaries.length}
          </div>
          <div className='text-xs text-muted-foreground'>Monthly Salaries</div>
        </div>
        <div className='p-3 border rounded-lg text-center'>
          <div className='text-lg font-semibold text-purple-600'>
            {bonusSalaries.length}
          </div>
          <div className='text-xs text-muted-foreground'>Bonuses</div>
        </div>
        <div className='p-3 border rounded-lg text-center'>
          <div className='text-lg font-semibold text-orange-600'>
            {overtimeSalaries.length}
          </div>
          <div className='text-xs text-muted-foreground'>Overtime</div>
        </div>
      </div>

      {/* Salary List */}
      <div className='space-y-4'>
        <h4 className='text-sm font-medium'>
          Salary History ({salaries.length} entries)
        </h4>
        <div className='space-y-3'>
          {salaries
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((salary) => (
              <SalaryItem key={salary.id} salary={salary} />
            ))}
        </div>
      </div>
    </div>
  );
}
