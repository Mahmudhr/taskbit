'use client';

import { z } from 'zod';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { getErrorMessage } from '@/lib/utils';
import { toast } from 'sonner';
import { useTransition } from 'react';
import { usePayment } from '@/hooks/use-payment';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/input';
import { PaymentTypes } from '@/types/common';
import { $Enums } from '@prisma/client';
import { Loader2Icon } from 'lucide-react';

const paymentTypes = [
  { label: 'Bank Transfer', value: 'BANK_TRANSFER' },
  { label: 'Bkash', value: 'BKASH' },
  { label: 'Nagad', value: 'NAGAD' },
];

const paymentStatuses = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Failed', value: 'FAILED' },
];

const FormSchema = z.object({
  paymentType: z.enum(['BANK_TRANSFER', 'BKASH', 'NAGAD'], {
    errorMap: () => ({ message: 'Please select a payment type' }),
  }),
  referenceNumber: z
    .string()
    .min(2, { message: 'Reference number is required' }),
  amount: z.coerce
    .number()
    .min(1, { message: 'Amount must be greater than 0' }),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED'], {
    errorMap: () => ({ message: 'Please select a status' }),
  }),
});

type CreatePaymentFormProps = {
  setIsOpen: (open: boolean) => void;
  taskId: number | null;
  data: PaymentTypes | null;
};

export default function UpdatePaymentForm({
  setIsOpen,
  taskId,
  data,
}: CreatePaymentFormProps) {
  const [isPending, startTransition] = useTransition();
  const { updatePaymentMutationAsync } = usePayment();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      paymentType: data?.paymentType as $Enums.PaymentType,
      referenceNumber: data?.referenceNumber || '',
      amount: data?.amount || 0,
      status: (data?.status as $Enums.PaymentStatus) || 'PENDING',
    },
  });
  if (!data) return null;

  function onSubmit(formData: z.infer<typeof FormSchema>) {
    if (!taskId) {
      toast.error('Task is missing');
      return;
    }
    const payload = {
      paymentId: taskId,
      status: formData.status as $Enums.PaymentStatus,
      paymentType: formData.paymentType as $Enums.PaymentType,
      referenceNumber: formData.referenceNumber,
    };
    startTransition(() => {
      toast.promise(updatePaymentMutationAsync(payload), {
        loading: 'Updating payment...',
        success: (res) => {
          setIsOpen(false);
          return res.message || 'Successfully Updated Payment';
        },
        error: (err) => getErrorMessage(err),
      });
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='paymentType'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select payment type' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className='z-[9999]'>
                  {paymentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='referenceNumber'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference Number</FormLabel>
              <FormControl>
                <Input
                  className='w-full'
                  placeholder='Enter reference number'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='amount'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  className='w-full'
                  type='number'
                  placeholder='Enter amount'
                  min={1}
                  {...field}
                  disabled
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='status'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className='z-[9999]'>
                  {paymentStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type='submit'
          disabled={isPending}
          className='flex justify-start'
        >
          {isPending && <Loader2Icon className='animate-spin' />}
          Update Payment
        </Button>
      </form>
    </Form>
  );
}
