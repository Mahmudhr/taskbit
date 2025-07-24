'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { TaskType } from '@/types/common';
import dayjs from 'dayjs';

import {
  getPaymentStatusBadge,
  getStatusBadge,
} from '@/app/(private)/dashboard/(admin)/tasks/page';

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

export default function TaskDetailsView({ task }: { task: TaskType }) {
  return (
    <div className='space-y-4'>
      <DetailItem label='Title' value={task.title} fieldName='Title' />
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
        <DetailItem
          label='Amount'
          value={`৳ ${task.amount}`}
          fieldName='Amount'
        />
        <DetailItem
          label='Due Amount'
          value={`৳ ${task.paid ? task.amount - task.paid : task.amount}`}
          fieldName='Due Amount'
        />
        <DetailItem
          label='Paid Amount'
          value={`৳ ${task.paid}`}
          fieldName='Paid Amount'
        />
        <div className='flex items-center justify-between p-3 border rounded-lg'>
          <div>
            <label className='text-sm font-medium text-muted-foreground'>
              Payment Status
            </label>
            <div className='mt-1'>
              {getPaymentStatusBadge(
                task.paid ? task.amount - task.paid : task.amount
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className='text-sm font-medium mb-4'>Task Details</h4>
        <div className='grid grid-cols-1 gap-4'>
          <DetailItem
            label='Description'
            value={task.description || 'Not provided'}
            fieldName='Description'
          />
          <DetailItem
            label='Link'
            value={task.link || 'Not provided'}
            fieldName='Link'
            isLink={true}
            displayValue={
              task.link && task.link.length > 50
                ? task.link.slice(0, 50) + '...'
                : task.link || 'Not provided'
            }
          />
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <DetailItem
              label='Duration'
              value={
                task.duration
                  ? dayjs(task.duration).format('DD-MM-YYYY')
                  : 'Not set'
              }
              fieldName='Duration'
            />
            <DetailItem
              label='Created At'
              value={dayjs(task.createdAt).format('DD-MM-YYYY, h:mm a')}
              fieldName='Created At'
            />
            <DetailItem
              label='Updated At'
              value={dayjs(task.updatedAt).format('DD-MM-YYYY, h:mm a')}
              fieldName='Updated At'
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className='text-sm font-medium mb-4'>Assignment Information</h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <DetailItem
            label='Assigned To'
            value={task.assignedTo?.name || 'Not assigned'}
            fieldName='Assigned To'
          />
          <DetailItem
            label='Assignee Email'
            value={task.assignedTo?.email || 'Not available'}
            fieldName='Assignee Email'
            displayValue={
              task.assignedTo?.email && task.assignedTo.email.length > 20
                ? task.assignedTo.email.slice(0, 20) + '...'
                : task.assignedTo?.email || 'Not available'
            }
          />
          <DetailItem
            label='Client'
            value={task.client?.name || 'Not assigned'}
            fieldName='Client'
          />
          <DetailItem
            label='Client Email'
            value={task.client?.email || 'Not available'}
            fieldName='Client Email'
            displayValue={
              task.client?.email && task.client.email.length > 20
                ? task.client.email.slice(0, 20) + '...'
                : task.client?.email || 'Not available'
            }
          />
        </div>
      </div>
    </div>
  );
}
