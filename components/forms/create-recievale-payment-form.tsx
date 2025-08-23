'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { usePayment } from '@/hooks/use-payment';
import { Button } from '../ui/button';
import { Loader2Icon } from 'lucide-react';

const FormSchema = z.object({
  amount: z.coerce
    .number()
    .min(1, { message: 'Amount must be greater than 0' }),
});

export default function CreateReceivablePaymentForm({
  setIsOpen,
  taskId,
}: {
  setIsOpen: (isOpen: boolean) => void;
  taskId: number | null;
}) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      amount: 0,
    },
  });
  const { createReceivablePaymentMutationAsync } = usePayment();

  function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!taskId) {
      toast.error('User or Task is missing');
      return;
    }
    const payload = {
      amount: data.amount,
      taskId: taskId,
    };
    startTransition(() => {
      toast.promise(createReceivablePaymentMutationAsync(payload), {
        loading: 'Creating Payment...',
        success: (res) => {
          setIsOpen(false);
          return res.message || 'Successfully Created Payment';
        },
        error: (err) => {
          const errorMessage = err.message || 'Failed to create payment';

          if (errorMessage.includes('cannot exceed remaining')) {
            return 'Payment amount exceeds the remaining task amount. Please check the due amount and try again.';
          }

          return errorMessage;
        },
      });
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
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

        <Button
          type='submit'
          disabled={isPending}
          className='flex justify-start'
        >
          {isPending && <Loader2Icon className='animate-spin' />}
          Create Receivable Payment
        </Button>
      </form>
    </Form>
  );
}
