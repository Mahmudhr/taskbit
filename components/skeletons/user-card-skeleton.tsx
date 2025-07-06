import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserCardSkeleton() {
  return (
    <div className='md:hidden block space-y-4'>
      {[...Array(5)].map((_, i) => (
        <Card key={i} className='p-4'>
          <div className='flex justify-between items-start mb-3'>
            <div className='flex items-start gap-2'>
              <Skeleton className='h-4 w-8' />
              <Skeleton className='h-4 w-24' />
            </div>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-8 w-8 rounded-full' />
              <Skeleton className='h-8 w-8 rounded-full' />
            </div>
          </div>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-4 w-16' />
            </div>
            <div className='flex justify-between'>
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-4 w-24' />
            </div>
            <div className='flex justify-between'>
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-4 w-20' />
            </div>
            <div className='flex justify-between items-center'>
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-4 w-16' />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
