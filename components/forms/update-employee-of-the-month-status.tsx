'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import useEmployeeOfTheMonth, {
  useFetchEmployeeOfTheMonth,
} from '@/hooks/use-employee-of-the-month';
import { useSession } from 'next-auth/react';

import dayjs from 'dayjs';
import { Button } from '@/components/ui/button';
import { Loader2Icon, Trophy } from 'lucide-react';

export default function UpdateEmployeeOfTheMonthStatus({
  setIsOpen,
}: {
  setIsOpen?: (open: boolean) => void;
}) {
  const { data: session } = useSession();
  const email = session?.user?.email ?? '';

  const { data, isLoading } = useFetchEmployeeOfTheMonth(email);
  const { updateEmployeeOfTheMonthViewMutationAsync } = useEmployeeOfTheMonth();

  const [isPending, startTransition] = useTransition();

  const [updated, setUpdated] = useState(false);

  if (isLoading || !data) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='p-8 relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50'
      >
        {/* Decorative elements skeleton */}
        <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/10 to-blue-200/10 rounded-bl-full animate-pulse' />
        <div className='absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/10 to-purple-200/10 rounded-tr-full animate-pulse' />

        <div className='relative'>
          {/* Trophy icon skeleton */}
          <div className='mb-8 inline-block'>
            <div className='w-16 h-16 rounded-full bg-yellow-500/20 animate-pulse' />
          </div>

          {/* Title skeleton */}
          <div className='h-9 w-64 bg-gradient-to-r from-purple-200/40 to-blue-200/40 dark:from-purple-700/40 dark:to-blue-700/40 rounded-lg animate-pulse mb-6' />

          {/* Text content skeletons */}
          <div className='space-y-4'>
            <div className='h-6 w-48 bg-gray-200/40 dark:bg-gray-700/40 rounded animate-pulse' />
            <div className='h-8 w-32 bg-blue-200/40 dark:bg-blue-700/40 rounded animate-pulse' />
          </div>

          {/* Description skeleton */}
          <div className='mt-6 space-y-2'>
            <div className='h-4 w-full bg-gray-200/40 dark:bg-gray-700/40 rounded animate-pulse' />
            <div className='h-4 w-3/4 bg-gray-200/40 dark:bg-gray-700/40 rounded animate-pulse' />
          </div>

          {/* Button skeleton */}
          <div className='mt-8'>
            <div className='h-10 w-32 bg-gradient-to-r from-blue-200/40 to-purple-200/40 dark:from-blue-700/40 dark:to-purple-700/40 rounded-lg animate-pulse' />
          </div>
        </div>
      </motion.div>
    );
  }

  const monthName = data.month
    ? dayjs()
        .month(data.month - 1)
        .format('MMMM')
    : dayjs().format('MMMM');

  const handleMarkViewed = async () => {
    try {
      startTransition(async () => {
        await updateEmployeeOfTheMonthViewMutationAsync(email);
        setUpdated(true);
        setIsOpen?.(false);
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='p-8 relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50'
    >
      {/* Decorative elements */}
      <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/20 to-blue-200/20 rounded-bl-full' />
      <div className='absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/20 to-purple-200/20 rounded-tr-full' />

      <div className='relative'>
        {/* Trophy icon with glow effect */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className='mb-8 inline-block'
        >
          <div className='relative'>
            <Trophy className='w-16 h-16 text-yellow-500' />
            <div className='absolute inset-0 animate-pulse bg-yellow-500/20 rounded-full blur-xl' />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className='text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent'>
            🎉 Congratulations! 🎊
          </h3>

          <p className='mt-4 text-lg font-medium text-gray-700 dark:text-gray-300'>
            You are elected Employee of the Month for
          </p>
          <p className='mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400'>
            {monthName} {data.year}
          </p>

          {data.description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className='mt-6 text-sm text-gray-600 dark:text-gray-400 italic border-l-2 border-blue-400 pl-4'
            >
              &ldquo;{data.description}&rdquo;
            </motion.p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className='mt-8 flex items-center gap-3'
        >
          {!updated && (
            <Button
              disabled={isPending}
              onClick={handleMarkViewed}
              className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium hover:scale-105 transition-all duration-300'
            >
              {isPending && <Loader2Icon className='animate-spin' />}✨ Accept
              Recognition
            </Button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
