import React from 'react';

export default function TaskCardSkeleton() {
  return (
    <div className='space-y-4 animate-pulse'>
      {[...Array(4)].map((_, idx) => (
        <div
          key={idx}
          className='p-4 border rounded-lg bg-white dark:bg-gray-400'
        >
          <div className='flex justify-between items-center mb-3'>
            <div className='flex items-center gap-2'>
              <div className='h-4 w-8 bg-gray-200 dark:bg-gray-600 rounded'></div>
              <div className='h-5 w-32 bg-gray-200 dark:bg-gray-600 rounded'></div>
            </div>
            <div className='flex gap-2'>
              <div className='h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded-full'></div>
              <div className='h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded-full'></div>
            </div>
          </div>
          <div className='space-y-2 text-sm'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='flex justify-between'>
                <div className='h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded'></div>
                <div className='h-4 w-24 bg-gray-200 dark:bg-gray-600 rounded'></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
