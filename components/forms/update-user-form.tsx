'use client';

import { UserType } from '@/types/common';
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
import { Button } from '../ui/button';
import { Loader2Icon } from 'lucide-react';
import { useTransition } from 'react';
import { useUser } from '@/hooks/use-user';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';

type UpdateUserFormProps = {
  data: UserType | null;
  setIsOpen: (open: boolean) => void;
};

export const FormSchema = z
  .object({
    name: z.string().min(2, {
      message: 'Username must be at least 2 characters.',
    }),
    email: z
      .string()
      .email({ message: 'Please enter a valid email address' })
      .min(5, { message: 'Email must be at least 5 characters long' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' })
      .optional()
      .or(z.literal('')),
    confirmPassword: z.string().optional().or(z.literal('')),
    phone: z
      .string()
      .min(10, { message: 'Phone number must be at least 10 digits long' })
      .max(15, { message: 'Phone number cannot be longer than 15 digits' })
      .regex(/^[+]?[0-9]+$/, {
        message: 'Phone number can only contain numbers and optional + prefix',
      }),
    role: z.enum(['USER', 'ADMIN'], {
      errorMap: () => ({ message: 'Please select a valid role' }),
    }),
    status: z.enum(['ACTIVE', 'INACTIVE'], {
      errorMap: () => ({ message: 'Please select a valid status' }),
    }),
  })
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.password.length >= 8;
      }
      return true;
    },
    {
      message: 'Password must be at least 8 characters long',
      path: ['password'],
    }
  )
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }
  );

export default function UpdateUserForm({
  data,
  setIsOpen,
}: UpdateUserFormProps) {
  const [isPending, startTransition] = useTransition();
  const { updateUserAsync } = useUser();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: data?.name || '',
      email: data?.email || '',
      password: '',
      confirmPassword: '',
      phone: data?.phone || '',
      role: data?.role || undefined,
      status: data?.status || undefined,
    },
  });

  function onSubmit(formData: z.infer<typeof FormSchema>) {
    if (!data?.id) return;
    const payload = {
      id: data.id,
      data: {
        name: formData.name,
        email: formData.email,
        password: formData.password ? formData.password : '',
        phone: formData.phone,
        role: formData.role,
        status: formData.status,
      },
    };
    startTransition(() => {
      toast.promise(updateUserAsync(payload), {
        loading: 'Updating user...',
        success: (res) => {
          setIsOpen(false);
          return res.message || 'Successfully updated user';
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
          name='name'
          render={({ field }) => (
            <FormItem className='flex-start'>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  className='w-full'
                  placeholder='Enter user name'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  className='w-full'
                  placeholder='Enter user email'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  className='w-full'
                  placeholder='Enter user password'
                  type='password'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  className='w-full'
                  placeholder='Enter user confirm password'
                  type='password'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='phone'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input
                  className='w-full'
                  placeholder='Enter user phone'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='role'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a user role' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className='z-[9999]'>
                  <SelectItem value='ADMIN'>Admin</SelectItem>
                  <SelectItem value='USER'>User</SelectItem>
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
                    <SelectValue placeholder='Select a user status' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className='z-[9999]'>
                  <SelectItem value='ACTIVE'>Active</SelectItem>
                  <SelectItem value='INACTIVE'>Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={isPending}>
          {isPending && <Loader2Icon className='animate-spin' />}
          Update
        </Button>
      </form>
    </Form>
  );
}
