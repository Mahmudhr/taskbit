import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='flex justify-center h-screen items-center'>
      <div className='flex flex-col justify-center items-center gap-4'>
        <div className='text-4xl font-bold'>404</div>
        <div className='text-gray-600 dark:text-gray-300'>
          Oops, This Page Is Not Found
        </div>
        <div>
          <Link href='/dashboard/my-tasks'>
            <Button size='sm'>Back to My Tasks</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
