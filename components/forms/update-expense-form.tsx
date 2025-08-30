'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2Icon } from 'lucide-react';

import { toast } from 'sonner';
import { useExpenses } from '@/hooks/use-expense';
import { getErrorMessage } from '@/lib/utils';
import { ExpensesType } from '@/types/common';

// Zod validation schema - matching your expense model
const createExpenseSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters')
    .trim(),
  amount: z.coerce
    .number()
    .min(1, { message: 'Amount must be greater than 0' }),
});

export default function UpdateExpenseForm({
  setIsOpen,
  data,
}: {
  setIsOpen: (open: boolean) => void;
  data: ExpensesType | null;
}) {
  const [isPending, startTransition] = useTransition();
  const { updateExpenseMutationAsync } = useExpenses();

  const form = useForm<z.infer<typeof createExpenseSchema>>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      title: data?.title || '',
      amount: data?.amount || 0,
    },
  });

  // const onSubmit = async (values: CreateExpenseFormValues) => {
  //   try {
  //     setIsSubmitting(true);

  //     await createExpenseMutationAsync({
  //       title: values.title,
  //       amount: values.amount,
  //     });

  //     form.reset();
  //     setIsOpen(false);

  //     toast.success('Expense created successfully!');
  //   } catch (error) {
  //     console.error('Error creating expense:', error);
  //     toast.error('Failed to create expense. Please try again.');
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  function onSubmit(formData: z.infer<typeof createExpenseSchema>) {
    if (!data?.id) return;
    const payload = {
      id: data?.id,
      amount: formData.amount,
      title: formData.title,
    };

    startTransition(() => {
      toast.promise(updateExpenseMutationAsync(payload), {
        loading: 'Updating Expense...',
        success: (res) => {
          setIsOpen(false);
          return res.message || 'Expense updated successfully';
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
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  className='w-full'
                  placeholder='Enter title'
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
              <FormLabel>Reference Number</FormLabel>
              <FormControl>
                <Input
                  className='w-full'
                  placeholder='Enter expense amount'
                  type='number'
                  min={1}
                  step={0.1}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type='submit'
          disabled={isPending || !form.formState.isDirty}
          className='flex justify-start'
        >
          {isPending && <Loader2Icon className='animate-spin' />}
          Create Expense
        </Button>
      </form>
    </Form>
  );
}
