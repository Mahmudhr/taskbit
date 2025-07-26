'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn, paymentStatusConvert, paymentTypeConvert } from '@/lib/utils';
import { $Enums } from '@prisma/client';
import dayjs from 'dayjs';

const getStatusBadge = (status: $Enums.PaymentStatus) => {
  const variants = {
    PENDING: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    COMPLETED: 'bg-green-100 text-green-800 hover:bg-green-200',
    FAILED: 'bg-red-100 text-red-800 hover:bg-red-200',
  } as const;
  return (
    <Badge className={cn(variants[status])}>
      {paymentStatusConvert[status]}
    </Badge>
  );
};

const PaymentItem = ({
  payment,
}: {
  payment: {
    id: number;
    paymentType: string;
    referenceNumber: string;
    amount: number;
    status: $Enums.PaymentStatus;
    createdAt: Date;
  };
}) => {
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

  return (
    <div className='p-4 border rounded-lg space-y-3'>
      {/* Payment Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium'>Payment #{payment.id}</span>
          {getStatusBadge(payment.status)}
        </div>
        <span className='text-lg font-semibold text-green-600'>
          ৳ {payment.amount}
        </span>
      </div>

      {/* Payment Details Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        {/* Payment Type */}
        <div className='flex items-center justify-between p-2 bg-muted rounded'>
          <div>
            <label className='text-xs font-medium text-muted-foreground'>
              Payment Type
            </label>
            <p className='text-sm'>
              {paymentTypeConvert[
                payment.paymentType as keyof typeof paymentTypeConvert
              ] || payment.paymentType}
            </p>
          </div>
        </div>

        {/* Reference Number */}
        <div className='flex items-center justify-between p-2 bg-muted rounded'>
          <div className='flex-1'>
            <label className='text-xs font-medium text-muted-foreground'>
              Reference Number
            </label>
            <p className='text-sm'>{payment.referenceNumber}</p>
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={() =>
              handleCopy(payment.referenceNumber, 'Reference Number')
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

        {/* Created Date */}
        <div className='flex items-center justify-between p-2 bg-muted rounded'>
          <div>
            <label className='text-xs font-medium text-muted-foreground'>
              Payment Date
            </label>
            <p className='text-sm'>
              {dayjs(payment.createdAt).format('DD-MM-YYYY')}
            </p>
          </div>
        </div>

        {/* Created Time */}
        <div className='flex items-center justify-between p-2 bg-muted rounded'>
          <div>
            <label className='text-xs font-medium text-muted-foreground'>
              Payment Time
            </label>
            <p className='text-sm'>
              {dayjs(payment.createdAt).format('h:mm A')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

type PaymentDetailsProps = {
  payments: {
    id: number;
    paymentType: string;
    referenceNumber: string;
    amount: number;
    status: $Enums.PaymentStatus;
    createdAt: Date;
  }[];
};

export default function PaymentDetails({ payments }: PaymentDetailsProps) {
  if (!payments || payments.length === 0) {
    return (
      <div className='text-center py-8'>
        <div className='text-muted-foreground'>
          <p className='text-lg font-medium'>No Payments Found</p>
          <p className='text-sm'>
            No payments have been made for this task yet.
          </p>
        </div>
      </div>
    );
  }

  const totalPaid = payments.reduce((sum, payment) => {
    return payment.status === 'COMPLETED' ? sum + payment.amount : sum;
  }, 0);

  const completedPayments = payments.filter((p) => p.status === 'COMPLETED');
  const pendingPayments = payments.filter((p) => p.status === 'PENDING');
  const failedPayments = payments.filter((p) => p.status === 'FAILED');

  return (
    <div className='space-y-6'>
      {/* Payment Summary */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='p-3 border rounded-lg text-center'>
          <div className='text-lg font-semibold text-green-600'>
            ৳ {totalPaid}
          </div>
          <div className='text-xs text-muted-foreground'>Total Paid</div>
        </div>
        <div className='p-3 border rounded-lg text-center'>
          <div className='text-lg font-semibold'>
            {completedPayments.length}
          </div>
          <div className='text-xs text-muted-foreground'>Completed</div>
        </div>
        <div className='p-3 border rounded-lg text-center'>
          <div className='text-lg font-semibold text-yellow-600'>
            {pendingPayments.length}
          </div>
          <div className='text-xs text-muted-foreground'>Pending</div>
        </div>
        <div className='p-3 border rounded-lg text-center'>
          <div className='text-lg font-semibold text-red-600'>
            {failedPayments.length}
          </div>
          <div className='text-xs text-muted-foreground'>Failed</div>
        </div>
      </div>

      {/* Payment List */}
      <div className='space-y-4'>
        <h4 className='text-sm font-medium'>Payment History</h4>
        <div className='space-y-3'>
          {payments
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((payment) => (
              <PaymentItem key={payment.id} payment={payment} />
            ))}
        </div>
      </div>
    </div>
  );
}
