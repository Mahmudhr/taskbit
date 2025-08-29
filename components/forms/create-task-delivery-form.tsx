'use client';

import { UserTaskType } from '@/types/common';
import { zodResolver } from '@hookform/resolvers/zod';
import { TaskStatus } from '@prisma/client';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { allTaskStatus, getErrorMessage, taskStatusConvert } from '@/lib/utils';
import { Button } from '../ui/button';
import { Loader2Icon, Users, X } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { useUserTask } from '@/hooks/use-user-task';
import ReactAsyncSelect from '../react-async-select';
import { SearchUserOption, useSearchMember } from '@/hooks/use-search-user';
import { Badge } from '../ui/badge';
import { useSession } from 'next-auth/react';

export type CreateTaskDeliveryFormProps = {
  setIsOpen: (isOpen: boolean) => void;
  data?: UserTaskType | null;
};

const FormSchema = z
  .object({
    title: z
      .string()
      .min(2, { message: 'Title must be at least 2 characters.' }),
    note: z.string().optional(),
    link: z.string().optional(),
    status: z.nativeEnum(TaskStatus),
    assignedUserIds: z.array(z.number()).optional(),
  })
  .refine(
    (data) => {
      if (data.status === TaskStatus.COMPLETED) {
        return (
          data.link &&
          data.link.trim().length > 0 &&
          z.string().url().safeParse(data.link).success
        );
      }

      if (data.link && data.link.trim().length > 0) {
        return z.string().url().safeParse(data.link).success;
      }
      return true;
    },
    {
      message:
        "Link is required and must be a valid URL when status is 'Submitted'",
      path: ['link'],
    }
  );

export default function CreateTaskDeliveryForm({
  setIsOpen,
  data,
}: CreateTaskDeliveryFormProps) {
  const [isPending, startTransition] = useTransition();
  const { updateUserTaskDeliveryMutationAsync } = useUserTask();
  const [selectedUsers, setSelectedUsers] = useState<SearchUserOption[]>([]);
  const { data: session } = useSession();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: data?.title || '',
      link: data?.link || '',
      status: data?.status || TaskStatus.PENDING,
      note: data?.note || '',
    },
  });

  const { search } = useSearchMember();

  const watchedStatus = form.watch('status');

  useEffect(() => {
    if (
      data?.assignedUsers &&
      Array.isArray(data.assignedUsers) &&
      data.assignedUsers.length > 0
    ) {
      const usersToSelect: SearchUserOption[] = data.assignedUsers.map(
        (user) => ({
          label: `${user.name} (${user.email})`,
          value: user.id,
          user: user,
        })
      );
      setSelectedUsers(usersToSelect);
      const userIds = usersToSelect.map((u) => u.value);
      form.setValue('assignedUserIds', userIds);
    }
  }, [data, form]);

  const addUser = (user: SearchUserOption) => {
    const isAlreadySelected = selectedUsers.some((u) => u.value === user.value);
    if (!isAlreadySelected) {
      const newSelectedUsers = [...selectedUsers, user];
      setSelectedUsers(newSelectedUsers);

      // Update form value
      const userIds = newSelectedUsers.map((u) => u.value);
      form.setValue('assignedUserIds', userIds);
    }
  };

  // Function to remove user from selected users
  const removeUser = (userId: number) => {
    const newSelectedUsers = selectedUsers.filter((u) => u.value !== userId);
    setSelectedUsers(newSelectedUsers);

    // Update form value
    const userIds = newSelectedUsers.map((u) => u.value);
    form.setValue('assignedUserIds', userIds);
  };

  function onSubmit(formData: z.infer<typeof FormSchema>) {
    if (!data?.id) return;

    const payload = {
      id: data.id,
      data: {
        ...formData,
        assignedUserIds: formData.assignedUserIds || [],
      },
    };

    startTransition(() => {
      toast.promise(updateUserTaskDeliveryMutationAsync(payload), {
        loading: 'Updating task...',
        success: (res) => {
          setIsOpen(false);
          return res.message || 'Successfully Task Delivered';
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
                  placeholder='Enter task title'
                  disabled={true}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='link'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Link{' '}
                {watchedStatus === TaskStatus.COMPLETED && (
                  <span className='text-red-500'>*</span>
                )}
              </FormLabel>
              <FormControl>
                <Input
                  className='w-full'
                  placeholder={
                    watchedStatus === TaskStatus.COMPLETED
                      ? 'Enter task delivery link (required)'
                      : 'Enter task delivery link (optional)'
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel className='flex items-center gap-2'>
            <Users className='h-4 w-4' />
            Assign To Users
          </FormLabel>

          {/* User Search */}
          <ReactAsyncSelect<SearchUserOption>
            label=''
            name='userSearch'
            loadOptions={async (inputValue: string) => {
              const options = await search(inputValue);
              const currentUserEmail = session?.user?.email;
              return options.filter(
                (option) =>
                  option.user.email !== currentUserEmail &&
                  !selectedUsers.some((u) => u.value === option.value)
              );
            }}
            onChange={(option) => {
              if (option) {
                addUser(option);
              }
            }}
            value={null} // Always null to allow multiple selections
            isClearable
            placeholder='Search user by name or email...'
          />

          <FormMessage />

          {/* Selected Users Display */}
          {selectedUsers.length > 0 && (
            <div className='mt-4 space-y-2'>
              <div className='text-sm font-medium text-muted-foreground'>
                Selected Users ({selectedUsers.length}):
              </div>
              <div className='flex flex-wrap gap-2'>
                {selectedUsers.map((user) => (
                  <Badge
                    key={user.value}
                    variant='secondary'
                    className='flex items-center gap-2 px-3 py-1'
                  >
                    <div className='flex flex-col items-start'>
                      <span className='font-medium'>{user.user.name}</span>
                      <span className='text-xs opacity-70'>
                        {user.user.email}
                      </span>
                    </div>
                    {session?.user?.email !== user.user.email && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground'
                        onClick={() => removeUser(user.value)}
                      >
                        <X className='h-3 w-3' />
                      </Button>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {selectedUsers.length === 0 && (
            <div className='mt-2 text-sm text-muted-foreground italic'>
              No users assigned yet. Search and select users above.
            </div>
          )}
        </FormItem>

        <FormField
          control={form.control}
          name='status'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  // Trigger validation for the link field when status changes
                  form.trigger('link');
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className='z-[9999]'>
                  {allTaskStatus.map((status) => (
                    <SelectItem key={status} value={status}>
                      {
                        taskStatusConvert[
                          status as keyof typeof taskStatusConvert
                        ]
                      }
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
          name='note'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Leave a note (optional)'
                  className='resize-none'
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
          Update Task
        </Button>
      </form>
    </Form>
  );
}
