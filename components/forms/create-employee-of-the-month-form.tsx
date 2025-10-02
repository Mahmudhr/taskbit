'use client';

import { useTransition, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { SearchUserOption } from '@/hooks/use-search-user';
import { useSearchUser } from '@/hooks/use-search-user';
import { toast } from 'sonner';
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
import useEmployeeOfTheMonth from '@/hooks/use-employee-of-the-month';
import { getErrorMessage } from '@/lib/utils';
import { X } from 'lucide-react';
import { UserSearchAndSelect } from '../ui/user-search-and-select';

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <div>
          <div className='space-y-2'>
            <FormLabel>Client</FormLabel>
            <FormField
              control={form.control}
              name='assignedToId'
              render={({ field }) => (
                <UserSearchAndSelect
                  placeholder='Search user by name or email...'
                  search={async (query: string) => {
                    const results = await search(query);
                    return results.map((option) => ({
                      ...option,
                      user: {
                        ...option.user,
                        email: option.user.email ?? '',
                      },
                    }));
                  }}
                  onSelect={(option) => {
                    setSelectedUser(option);
                    field.onChange(option ? option.value : 0);
                  }}
                />
              )}
            />
          </div>

          <div>
            {selectedUser && (
              <Card className='mt-4 p-4 break-words whitespace-pre-line w-full flex justify-between'>
                <div>
                  <div className='font-semibold break-words whitespace-pre-line text-left'>
                    {selectedUser.user.name}
                  </div>
                  <div className='text-xs text-gray-600 break-all text-left'>
                    {selectedUser.user.email}
                  </div>
                </div>
                <div
                  onClick={() => {
                    setSelectedUser(null);
                    form.setValue('assignedToId', 0);
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </div>
              </Card>
            )}
          </div>
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
