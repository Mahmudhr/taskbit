'use client';

import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';
import { useTransition } from 'react';
import { createUser } from '@/server/user/user';
import { getErrorMessage } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
import { Loader2Icon } from 'lucide-react';

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
      .min(8, { message: 'Password must be at least 8 characters long' }),

    confirmPassword: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' }),

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
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const fields = [
  {
    name: 'name',
    label: 'Name',
    placeholder: 'John Doe',
  },
  {
    name: 'email',
    label: 'Email',
    placeholder: 'email@example.com',
  },
  {
    name: 'password',
    label: 'Password',
    placeholder: 'enter your password',
  },
  {
    name: 'confirmPassword',
    label: 'Confirm password',
    placeholder: 'enter confirm password',
  },
  {
    name: 'phone',
    label: 'Phone',
    placeholder: 'enter your number',
  },
];

export default function AddUserForm({
  setIsOpen,
}: {
  setIsOpen: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const { createUserAsync } = useUser();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    startTransition(() => {
      toast.promise(createUserAsync(data), {
        loading: 'Creating user...',
        success: (res) => {
          setIsOpen(false);
          return res.message || 'Successfully created user';
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
            <FormItem>
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
        <Button
          type='submit'
          disabled={isPending}
          className='flex justify-start'
        >
          {isPending && <Loader2Icon className='animate-spin' />}
          Create
        </Button>
      </form>
    </Form>
  );
}
