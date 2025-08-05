'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { UserType } from '@/types/common';
import { roleConvert, userStatusConvert } from '@/lib/utils';
import dayjs from 'dayjs';

interface UserDetailsViewProps {
  user: UserType;
}

const getStatusBadge = (status: string) => {
  const variants = {
    active: 'default',
    inactive: 'secondary',
  } as const;
  return (
    <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
      {userStatusConvert[status as keyof typeof userStatusConvert] || status}
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
      <p className='text-sm text-start'>{displayValue || value}</p>
    </div>
  );
};

export default function UserProfileDetailsView({ user }: UserDetailsViewProps) {
  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <DetailItem label='Name' value={user.name} fieldName='Name' />
        <DetailItem
          label='Email'
          value={user.email}
          displayValue={
            user.email.length > 20
              ? user.email.slice(0, 20) + '...'
              : user.email
          }
          fieldName='Email'
        />
        <DetailItem
          label='Role'
          value={roleConvert[user.role]}
          fieldName='Role'
        />
        <div className='flex items-center justify-between p-3 border rounded-lg'>
          <div className=''>
            <label className='text-sm font-medium text-muted-foreground'>
              Status
            </label>
            <div className='mt-1'>{getStatusBadge(user.status)}</div>
          </div>
        </div>
        <DetailItem
          label='Phone'
          value={user.phone || 'Not provided'}
          fieldName='Phone'
        />
        <DetailItem
          label='WhatsApp'
          value={user.whatsapp || 'Not provided'}
          fieldName='WhatsApp'
        />
        <DetailItem
          label='Created At'
          value={dayjs(user.createdAt).format('DD-MM-YYYY HH:mm')}
          fieldName='Created At'
        />
        <DetailItem
          label='Updated At'
          value={dayjs(user.updatedAt).format('DD-MM-YYYY HH:mm')}
          fieldName='Updated At'
        />
      </div>

      <Separator />

      <div>
        <h4 className='text-sm font-medium mb-4'>Payment Information</h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <DetailItem
            label='Bkash Number'
            value={user.bkashNumber || 'Not provided'}
            fieldName='Bkash Number'
          />
          <DetailItem
            label='Nagad Number'
            value={user.nagadNumber || 'Not provided'}
            fieldName='Nagad Number'
          />
          <DetailItem
            label='Bank Account'
            value={user.bankAccountNumber || 'Not provided'}
            fieldName='Bank Account'
          />
          <DetailItem
            label='Bank Name'
            value={user.bankName || 'Not provided'}
            fieldName='Bank Name'
          />
          <DetailItem
            label='Branch Name'
            value={user.branchName || 'Not provided'}
            fieldName='Branch Name'
          />
          <DetailItem
            label='Swift Code'
            value={user.swiftCode || 'Not provided'}
            fieldName='Swift Code'
          />
        </div>
      </div>
    </div>
  );
}
