'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { UserTaskType } from '@/types/common';
import dayjs from 'dayjs';

const getStatusBadge = (status: string) => {
  const statusVariants = {
    PENDING: 'secondary',
    IN_PROGRESS: 'default',
    SUBMITTED: 'outline',
    COMPLETED: 'default',
    CANCELLED: 'destructive',
  } as const;

  const statusLabels = {
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    SUBMITTED: 'Submitted',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  } as const;

  return (
    <Badge
      variant={
        statusVariants[status as keyof typeof statusVariants] || 'secondary'
      }
    >
      {statusLabels[status as keyof typeof statusLabels] || status}
    </Badge>
  );
};

const getPaperTypeBadge = (paperType: string) => {
  const paperTypeVariants = {
    CONFERENCE: 'default',
    JOURNAL: 'secondary',
    THESIS: 'outline',
  } as const;

  const paperTypeLabels = {
    CONFERENCE: 'Conference',
    JOURNAL: 'Journal',
    THESIS: 'Thesis',
  } as const;

  return (
    <Badge
      variant={
        paperTypeVariants[paperType as keyof typeof paperTypeVariants] ||
        'secondary'
      }
    >
      {paperTypeLabels[paperType as keyof typeof paperTypeLabels] || paperType}
    </Badge>
  );
};

const getPaymentStatusBadge = (paidAmount: number, totalAmount: number) => {
  const remaining = totalAmount - paidAmount;

  if (remaining <= 0) {
    return <Badge variant='default'>Fully Paid</Badge>;
  } else if (paidAmount > 0) {
    return <Badge variant='secondary'>Partially Paid</Badge>;
  } else {
    return <Badge variant='destructive'>Unpaid</Badge>;
  }
};

const DetailItem = ({
  label,
  value,
  fieldName,
  displayValue,
  isLink = false,
}: {
  label: string;
  value: string;
  fieldName: string;
  displayValue?: string;
  isLink?: boolean;
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
    <div className='p-3 border rounded-lg'>
      <div className='flex items-center gap-2 mb-1'>
        <label className='text-sm font-medium text-muted-foreground text-start'>
          {label}
        </label>
        <div className='flex gap-1'>
          {isLink && value && value !== 'Not provided' && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => window.open(value, '_blank')}
              className='h-6 w-6 p-0'
            >
              <ExternalLink className='h-3 w-3' />
            </Button>
          )}
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleCopy(value, fieldName)}
            className='h-6 w-6 p-0'
          >
            {copiedField === fieldName ? (
              <Check className='h-3 w-3 text-green-600' />
            ) : (
              <Copy className='h-3 w-3' />
            )}
          </Button>
        </div>
      </div>
      <p className='text-sm text-start'>{displayValue || value}</p>
    </div>
  );
};

export default function UserTaskDetails({ task }: { task: UserTaskType }) {
  const remainingAmount = task.amount - (task.paid || 0);

  return (
    <div className='space-y-4'>
      {/* Task Title */}
      <DetailItem label='Title' value={task.title} fieldName='Title' />

      {/* Status and Paper Type */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='flex items-center justify-between p-3 border rounded-lg'>
          <div>
            <label className='text-sm font-medium text-muted-foreground'>
              Status
            </label>
            <div className='mt-1'>{getStatusBadge(task.status)}</div>
          </div>
        </div>
        <div className='flex items-center justify-between p-3 border rounded-lg'>
          <div>
            <label className='text-sm font-medium text-muted-foreground'>
              Paper Type
            </label>
            <div className='mt-1'>{getPaperTypeBadge(task.paper_type)}</div>
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        <DetailItem
          label='Total Amount'
          value={`৳ ${task.amount}`}
          fieldName='Total Amount'
        />
        <DetailItem
          label='Paid Amount'
          value={`৳ ${task.paid || 0}`}
          fieldName='Paid Amount'
        />
        <DetailItem
          label='Due Amount'
          value={`৳ ${remainingAmount}`}
          fieldName='Due Amount'
        />
      </div>

      {/* Payment Status */}
      <div className='flex items-center justify-between p-3 border rounded-lg'>
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            Payment Status
          </label>
          <div className='mt-1'>
            {getPaymentStatusBadge(task.paid || 0, task.amount)}
          </div>
        </div>
      </div>

      <Separator />

      {/* Task Details */}
      <div className='space-y-4'>
        <h4 className='text-sm font-medium'>Task Details</h4>

        <DetailItem
          label='Description'
          value={task.description || 'Not provided'}
          fieldName='Description'
        />

        <DetailItem
          label='Task Link'
          value={task.link || 'Not provided'}
          fieldName='Task Link'
          isLink={true}
          displayValue={
            task.link && task.link.length > 50
              ? task.link.slice(0, 50) + '...'
              : task.link || 'Not provided'
          }
        />

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <DetailItem
            label='Deadline'
            value={
              task.duration
                ? dayjs(task.duration).format('DD-MM-YYYY')
                : 'Not set'
            }
            fieldName='Deadline'
          />
          <DetailItem
            label='Created At'
            value={dayjs(task.createdAt).format('DD-MM-YYYY HH:mm')}
            fieldName='Created At'
          />
        </div>
      </div>
    </div>
  );
}
