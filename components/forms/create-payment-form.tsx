'use client';

import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { usePayment } from '@/hooks/use-payment';
import { useSession } from 'next-auth/react';
import { getErrorMessage } from '@/lib/utils';

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
};

export default function CreatePaymentForm({
  setIsOpen,
  taskId,
}: CreatePaymentFormProps) {
  const [isPending, startTransition] = useTransition();
  const { createPaymentMutationAsync } = usePayment();
  const { data: session } = useSession();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      paymentType: undefined,
      referenceNumber: '',
      amount: 0,
      status: 'PENDING',
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!session?.user.id || !taskId) {
      toast.error('User or Task is missing');
      return;
    }
    const payload = {
      paymentType: data.paymentType,
      referenceNumber: data.referenceNumber,
      amount: data.amount,
      status: data.status,
      userId: session.user.id,
      taskId: taskId,
    };
    startTransition(() => {
      toast.promise(createPaymentMutationAsync(payload), {
        loading: 'Creating user...',
        success: (res) => {
          setIsOpen(false);
          return res.message || 'Successfully Created Payment';
        },
        error: (err) => getErrorMessage(err),
      });
    });
    // startTransition(() => {
    //   toast.promise(createPaymentAsync(payload), {
    //     loading: 'Creating payment...',
    //     success: (res) => {
    //       setIsOpen(false);
    //       return res.message || 'Successfully Created Payment';
    //     },
    //     error: 'Failed to create payment',
    //   });
    // });
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
          Create Payment
        </Button>
      </form>
    </Form>
  );
}
