import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
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
import { Button } from '../ui/button';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/hooks/use-user';
import { CreateNewClientType } from '@/server/types/client-type';
import { getErrorMessage } from '@/lib/utils';
type AddNewClientFormProps = {
  setIsOpen: (value: boolean) => void;
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
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function AddNewClientForm({ setIsOpen }: AddNewClientFormProps) {
  const [isPending, startTransition] = useTransition();
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

  const { createNewClientAsync } = useUser();

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const payload: CreateNewClientType = {
      ...data,
      status: 'ACTIVE',
    };
    startTransition(() => {
      toast.promise(createNewClientAsync(payload), {
        loading: 'Creating New Client...',
        success: (res) => {
          setIsOpen(false);
          return res.message || 'Successfully created New Client';
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
