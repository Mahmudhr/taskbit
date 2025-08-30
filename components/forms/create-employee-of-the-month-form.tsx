'use client';

import { useTransition, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { SearchUserOption } from '@/hooks/use-search-user';
import { useSearchUser } from '@/hooks/use-search-user';
import { toast } from 'sonner';
import ReactAsyncSelect from '../react-async-select';
import { Textarea } from '../ui/textarea';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Card } from '../ui/card';
import { useSession } from 'next-auth/react';
import useEmployeeOfTheMonth from '@/hooks/use-employee-of-the-month';
import { getErrorMessage } from '@/lib/utils';

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

const FormSchema = z.object({
  description: z.string().optional(),
  assignedToId: z.coerce
    .number()
    .min(1, { message: 'Please select a user to assign' }),
  month: z.coerce
    .number()
    .min(1, { message: 'Please select a month' })
    .max(12, { message: 'Invalid month' }),
  year: z.coerce
    .number()
    .min(2020, { message: 'Year must be 2020 or later' })
    .max(2050, { message: 'Year must be 2050 or earlier' }),
});

export default function CreateEmployeeOfTheMonthForm({
  setIsOpen,
}: {
  setIsOpen: (isOpen: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const { search } = useSearchUser();
  const [selectedUser, setSelectedUser] = useState<SearchUserOption | null>(
    null
  );
  const { data: session } = useSession();
  const { createEmployeeOfTheMonthMutationAsync } = useEmployeeOfTheMonth();
  //   const [options, setOptions] = useState<SearchUserOption[]>([]);
  //   const [addUser, setAddUser] = useState<SearchUserOption | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      assignedToId: 0,
      description: '',
    },
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => ({
    label: (currentYear - 5 + i).toString(),
    value: currentYear - 5 + i,
  }));

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    console.log({ data });
    // const payload: {
    //   year: number;
    //   month: number;
    //   description?: string | null;
    //   is_view: boolean;
    //   userId?: number | undefined;
    // } = {
    //   year: Number(values.year),
    //   month: Number(values.month),
    //   description: values.description || null,
    //   is_view: false,
    //   assignedToId: values.assignedToId,
    // };
    // startTransition(async () => {
    //   try {
    //     const res = await fetch('/api/employee-of-month', {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify(payload),
    //     });
    //     const body = await res.json();
    //     if (body?.success) {
    //       toast.success('Employee of the month created');
    //       setIsOpen(false);
    //     } else {
    //       toast.error(body?.message || 'Failed to create record');
    //     }
    //   } catch (err) {
    //     const message =
    //       err instanceof Error ? err.message : 'Failed to create record';
    //     toast.error(message);
    //   }
    // });

    startTransition(() => {
      toast.promise(createEmployeeOfTheMonthMutationAsync(data), {
        loading: 'Creating Employee of the Month...',
        success: (res) => {
          setIsOpen(false);
          return res.message || 'Successfully Created Employee of the Month';
        },
        error: (err) => getErrorMessage(err),
      });
    });
  };

  //   console.log({ options });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        {/* user search & select */}

        {/* <div>
          <ReactAsyncSelect<SearchUserOption>
            name='user'
            label='Select User (optional)'
            loadOptions={handleSearch}
            value={null}
            //   onInputChange={handleSearch}
            onChange={(opt) => {
              if (opt) {
                addUser(opt);
              }
            }}
            isClearable
            placeholder='Search users by name or email'
          />
        </div> */}

        <FormField
          control={form.control}
          name='assignedToId'
          render={({ field }) => (
            <FormItem>
              <ReactAsyncSelect<SearchUserOption>
                label='Assign To'
                name='assignedToId'
                loadOptions={async (inputValue: string) => {
                  const options = await search(inputValue);
                  const currentUserEmail = session?.user?.email;
                  return options.filter(
                    (option) => option.user.email !== currentUserEmail
                  );
                }}
                onChange={(option) => {
                  field.onChange(option ? option.value : 0);
                  setSelectedUser(option);
                }}
                isClearable
                placeholder='Search user by name or email...'
              />
              <FormMessage />
              {selectedUser && (
                <Card className='mt-4 p-4 break-words whitespace-pre-line w-full'>
                  <div className='font-semibold break-words whitespace-pre-line text-left'>
                    {selectedUser.user.name}
                  </div>
                  <div className='text-xs text-gray-600 break-all text-left'>
                    {selectedUser.user.email}
                  </div>
                </Card>
              )}
            </FormItem>
          )}
        />

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
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Tell us a little bit about the task'
                  className='resize-none'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex justify-end gap-2'>
          <Button
            type='button'
            variant='ghost'
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button type='submit' disabled={isPending}>
            Create
          </Button>
        </div>
      </form>
    </Form>
  );
}
