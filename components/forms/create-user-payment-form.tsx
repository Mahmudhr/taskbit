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
import { getErrorMessage } from '@/lib/utils';
import { Loader2Icon } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { useSalary } from '@/hooks/use-salary';
// import { useSalary } from '@/hooks/use-salary';

const salaryTypes = [
  { label: 'Monthly Salary', value: 'MONTHLY' },
  { label: 'Bonus', value: 'BONUS' },
  { label: 'Overtime', value: 'OVERTIME' },
];

const salaryStatuses = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const months = [
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 },
];

const paymentTypes = [
  { label: 'Bank Transfer', value: 'BANK_TRANSFER' },
  { label: 'Bkash', value: 'BKASH' },
  { label: 'Nagad', value: 'NAGAD' },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => ({
  label: (currentYear - 5 + i).toString(),
  value: currentYear - 5 + i,
}));

const FormSchema = z.object({
  amount: z.coerce
    .number()
    .min(1, { message: 'Amount must be greater than 0' }),
  month: z.coerce
    .number()
    .min(1, { message: 'Please select a month' })
    .max(12, { message: 'Invalid month' }),
  year: z.coerce
    .number()
    .min(2020, { message: 'Year must be 2020 or later' })
    .max(2050, { message: 'Year must be 2050 or earlier' }),
  status: z.enum(['PENDING', 'PAID', 'CANCELLED'], {
    errorMap: () => ({ message: 'Please select a status' }),
  }),
  paymentType: z.enum(['BANK_TRANSFER', 'BKASH', 'NAGAD'], {
    errorMap: () => ({ message: 'Please select a payment type' }),
  }),
  salaryType: z.enum(['MONTHLY', 'BONUS', 'OVERTIME'], {
    errorMap: () => ({ message: 'Please select a salary type' }),
  }),
  referenceNumber: z.string().optional(),
  note: z.string().optional(),
});

type CreateSalaryFormProps = {
  setIsOpen: (open: boolean) => void;
  userId: number | null;
};

export default function CreateSalaryForm({
  setIsOpen,
  userId,
}: CreateSalaryFormProps) {
  const [isPending, startTransition] = useTransition();
  const { createSalaryMutationAsync } = useSalary();
  // const { data: session } = useSession();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      amount: 0,
      month: new Date().getMonth() + 1, // Current month
      year: new Date().getFullYear(), // Current year
      status: 'PENDING',
      salaryType: 'MONTHLY',
      referenceNumber: '',
      note: '',
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!userId) {
      toast.error('User is missing');
      return;
    }

    const payload = {
      amount: data.amount,
      month: data.month,
      year: data.year,
      status: data.status,
      salaryType: data.salaryType,
      referenceNumber: data.referenceNumber || undefined,
      note: data.note || undefined,
      paymentType: data.paymentType || undefined,
      userId: userId.toString(),
    };

    startTransition(() => {
      toast.promise(createSalaryMutationAsync(payload), {
        loading: 'Creating Salary...',
        success: (res) => {
          setIsOpen(false);
          return res.message || 'Successfully Created Salary';
        },
        error: (err) => getErrorMessage(err),
      });
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
                    placeholder='Enter salary amount'
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
            name='salaryType'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select salary type' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className='z-[9999]'>
                    {salaryTypes.map((type) => (
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
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='month'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Month</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select month' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className='z-[9999]'>
                    {months.map((month) => (
                      <SelectItem
                        key={month.value}
                        value={month.value.toString()}
                      >
                        {month.label}
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
            name='year'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select year' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className='z-[9999]'>
                    {years.map((year) => (
                      <SelectItem
                        key={year.value}
                        value={year.value.toString()}
                      >
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
                  {salaryStatuses.map((status) => (
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

        <FormField
          control={form.control}
          name='referenceNumber'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference Number (Optional)</FormLabel>
              <FormControl>
                <Input
                  className='w-full'
                  placeholder='Enter reference number (e.g., SAL-2025-08-001)'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='note'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  className='w-full'
                  placeholder='Enter additional notes about this salary entry'
                  rows={3}
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
          Create Salary
        </Button>
      </form>
    </Form>
  );
}
