'use client';

import { Eye, EyeOff, Loader2Icon } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { z } from 'zod';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getErrorMessage } from '@/lib/utils';
import { toast } from 'sonner';
import { resetPassword } from '@/server/user/forgot-password';
import { useRouter } from 'next/navigation';

type UserPasswordChangeForm = {
  otp: string;
  email: string;
  setEmail: (email: string) => void;
  setOtp: (otp: string) => void;
};

const FormSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' }),

    confirmPassword: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function UserPasswordChangeForm({
  otp,
  email,
  setEmail,
  setOtp,
}: UserPasswordChangeForm) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    startTransition(async () => {
      toast.promise(
        resetPassword({
          newPassword: data.password,
          code: otp,
          email,
        }),
        {
          loading: 'Changing password...',
          success: (res: { success: boolean; message: string }) => {
            if (!res.success) {
              throw new Error(res.message);
            }
            setEmail('');
            setOtp('');
            router.push('/signin');
            return res.message;
          },
          error: (err) => getErrorMessage(err),
        }
      );
    });
  };

  return (
    <Card className='w-full max-w-md'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold'>Change Password</CardTitle>
        <CardDescription className=''>
          Enter your email to change your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
            autoComplete='off'
          >
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem className='relative'>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      className='w-full'
                      placeholder='Enter user password'
                      type={showPassword ? 'text' : 'password'}
                      autoComplete='new-password'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  {!showPassword && (
                    <span onClick={() => setShowPassword(true)}>
                      <Eye className='w-5 h-5 absolute right-2 top-10' />
                    </span>
                  )}
                  {showPassword && (
                    <span onClick={() => setShowPassword(false)}>
                      <EyeOff className='w-5 h-5 absolute right-2 top-10' />
                    </span>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem className='relative'>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      className='w-full'
                      placeholder='Enter user confirm password'
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete='new-password'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  {!showConfirmPassword && (
                    <span onClick={() => setShowConfirmPassword(true)}>
                      <Eye className='w-5 h-5 absolute right-2 top-10' />
                    </span>
                  )}
                  {showConfirmPassword && (
                    <span onClick={() => setShowConfirmPassword(false)}>
                      <EyeOff className='w-5 h-5 absolute right-2 top-10' />
                    </span>
                  )}
                </FormItem>
              )}
            />

            <Button type='submit' disabled={isPending}>
              {isPending && <Loader2Icon className='animate-spin' />} Reset
              Password
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
