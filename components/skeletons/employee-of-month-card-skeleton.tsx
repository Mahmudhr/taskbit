import { Skeleton } from '@/components/ui/skeleton';

export default function EmployeeOfMonthCardSkeleton() {
  return (
    <article className='bg-white dark:bg-neutral-900 shadow-sm rounded-lg border p-4 sm:flex sm:items-center sm:gap-6'>
      <div className='flex-shrink-0 flex items-center justify-center w-full sm:w-28 h-28 sm:h-28 rounded-md bg-muted overflow-hidden'>
        <div className='w-24 h-24 sm:w-28 sm:h-28'>
          <Skeleton className='w-full h-full' />
        </div>
      </div>

      <div className='mt-3 sm:mt-0 flex-1 w-full'>
        <div className='flex items-start justify-between gap-4'>
          <div className='space-y-2 w-2/3'>
            <Skeleton className='h-5 w-3/4' />
            <Skeleton className='h-4 w-1/2' />
          </div>

          <div className='text-right space-y-2 w-1/3'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-5 w-full' />
            <Skeleton className='h-4 w-3/4' />
          </div>
        </div>

        <div className='mt-3'>
          <Skeleton className='h-3 w-full' />
          <Skeleton className='h-3 w-5/6 mt-2' />
        </div>

        <div className='mt-4 text-xs'>
          <Skeleton className='h-3 w-1/4' />
        </div>
      </div>
    </article>
  );
}
