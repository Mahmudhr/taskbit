import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='flex justify-center h-screen items-center'>
      <div className='flex flex-col justify-center items-center gap-4'>
        <div className='text-2xl font-bold'>Access Denied</div>
        <Lock className='w-12 h-12' />
        <div className='text-gray-600'>
          You&apos;re not permission to access this page
        </div>
        <div>
          <Link href='/dashboard/my-tasks'>
            <Button>Back to My task</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
