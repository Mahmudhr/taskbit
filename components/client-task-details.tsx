'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { ClientTaskType } from '@/types/common';
import dayjs from 'dayjs';
import { clientTaskTypeConverter } from '@/lib/utils';

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
    SURVEY: 'secondary',
    JOURNAL: 'secondary',
    BOOK_CHAPTER: 'outline',
    Journal_Q1: 'default',
    Journal_Q2: 'secondary',
    Journal_Q3: 'outline',
    Journal_Q4: 'destructive',
    THESIS: 'outline',
    Bicent_RESEARCH: 'default',
    ASSIGNMENT: 'secondary',
    REWRITE: 'outline',
    OTHERS: 'secondary',
  } as const;

  const paperTypeLabels = {
    CONFERENCE: 'Conference',
    SURVEY: 'Survey',
    JOURNAL: 'Journal',
    BOOK_CHAPTER: 'Book Chapter',
    Journal_Q1: 'Journal Q1',
    Journal_Q2: 'Journal Q2',
    Journal_Q3: 'Journal Q3',
    Journal_Q4: 'Journal Q4',
    THESIS: 'Thesis',
    Bicent_RESEARCH: 'Bicent Research',
    ASSIGNMENT: 'Assignment',
    REWRITE: 'Rewrite',
    OTHERS: 'Others',
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

const DetailItem = ({
  label,
  value,
  fieldName,
  displayValue,
}: {
  label: string;
  value: string;
  fieldName: string;
  displayValue?: string;
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

export default function ClientTaskDetails({ data }: { data: ClientTaskType }) {
  return (
    <div className='space-y-4'>
      {/* Task Title */}
      <DetailItem label='Title' value={data.title} fieldName='Title' />

      {/* Status and Paper Type */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='flex items-center justify-between p-3 border rounded-lg'>
          <div>
            <label className='text-sm font-medium text-muted-foreground'>
              Status
            </label>
            <div className='mt-1'>{getStatusBadge(data.status)}</div>
          </div>
        </div>
        <div className='flex items-center justify-between p-3 border rounded-lg'>
          <div>
            <label className='text-sm font-medium text-muted-foreground'>
              Paper Type
            </label>
            <div className='mt-1'>{getPaperTypeBadge(data.paper_type)}</div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Task Details */}
      <div className='space-y-4'>
        <DetailItem
          label='Description'
          value={data.description || 'Not provided'}
          fieldName='Description'
        />
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <DetailItem
            label='Unique ID'
            value={data.unique_id || 'Not provided'}
            fieldName='Unique ID'
          />
          <div className='flex items-center justify-between p-3 border rounded-lg'>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>
                Task Type
              </label>
              <div className='mt-1'>
                {
                  clientTaskTypeConverter[
                    data.task_type as keyof typeof clientTaskTypeConverter
                  ]
                }
              </div>
            </div>
          </div>
        </div>

        <DetailItem
          label='Correction Description'
          value={data.correction_description || 'Not provided'}
          fieldName='Correction Description'
        />

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <DetailItem
            label='Amount'
            value={`${data.amount?.toFixed(2) || '0.00'}`}
            fieldName='Amount'
          />
          <DetailItem
            label='Paid Amount'
            value={`${data.paid_amount?.toFixed(2) || '0.00'}`}
            fieldName='Paid Amount'
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <DetailItem
            label='Duration/Deadline'
            value={
              data.duration
                ? dayjs(data.duration).format('DD-MM-YYYY')
                : 'Not set'
            }
            fieldName='Duration'
          />
          <DetailItem
            label='Created At'
            value={dayjs(data.createdAt).format('DD-MM-YYYY HH:mm')}
            fieldName='Created At'
          />
        </div>

        <DetailItem
          label='Last Updated'
          value={dayjs(data.updatedAt).format('DD-MM-YYYY HH:mm')}
          fieldName='Last Updated'
        />
      </div>
    </div>
  );
}
