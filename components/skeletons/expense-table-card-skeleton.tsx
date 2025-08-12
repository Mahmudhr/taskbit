import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

export default function ExpenseCardSkeleton() {
  return (
    <Card className='mb-4'>
      <CardContent className='p-4'>
        <div className='flex items-start justify-between mb-3'>
          <div className='flex items-center space-x-3'>
            <Skeleton className='w-10 h-10 rounded-full' />
            <div>
              <Skeleton className='h-5 w-32 mb-1' />
              <Skeleton className='h-4 w-16' />
            </div>
          </div>
          <div className='text-right'>
            <Skeleton className='h-6 w-20 mb-2' />
            <Skeleton className='h-8 w-8' />
          </div>
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-4 w-24' />
        </div>
      </CardContent>
    </Card>
  );
}
