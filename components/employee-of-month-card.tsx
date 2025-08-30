import Image from 'next/image';
import dayjs from 'dayjs';

export type EmployeeOfTheMonthType = {
  id: number;
  description: string | null;
  is_view: boolean;
  month: number;
  year: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  userId: number | null;
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
};

export default function EmployeeOfMonthCard({
  employee,
}: {
  employee: EmployeeOfTheMonthType;
}) {
  const monthName = employee.month
    ? dayjs()
        .month(employee.month - 1)
        .format('MMMM')
    : '';

  return (
    <article className='bg-white dark:bg-neutral-900 shadow-sm rounded-lg border p-4 sm:flex sm:items-center sm:gap-6'>
      <div className='flex-shrink-0 flex items-center justify-center w-full sm:w-28 h-28 sm:h-28 rounded-md bg-muted overflow-hidden'>
        {employee.user ? (
          <div className='relative w-24 h-24 sm:w-28 sm:h-28'>
            <Image
              src='/placeholder-user.jpg'
              alt={employee.user.name}
              fill
              className='object-cover'
            />
          </div>
        ) : (
          <div className='flex items-center justify-center w-full h-full text-sm text-muted-foreground'>
            No user
          </div>
        )}
      </div>

      <div className='mt-3 sm:mt-0 flex-1 w-full'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h3 className='text-lg font-semibold'>
              {employee.user ? employee.user.name : '— Not selected —'}
            </h3>
            <p className='text-sm text-muted-foreground'>
              {employee.user ? employee.user.email : 'No user assigned'}
            </p>
          </div>

          <div className='text-right'>
            <div className='text-sm text-muted-foreground'>Month</div>
            <div className='text-base font-medium'>
              {monthName} {employee.year}
            </div>
            <div className='mt-2'>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  employee.is_view
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {employee.is_view ? 'Viewed' : 'Not viewed'}
              </span>
            </div>
          </div>
        </div>

        {employee.description && (
          <p className='mt-3 text-sm text-gray-700 dark:text-gray-300 break-words'>
            {employee.description}
          </p>
        )}

        <div className='mt-4 text-xs text-muted-foreground'>
          Created: {dayjs(employee.createdAt).format('DD MMM YYYY')}
        </div>
      </div>
    </article>
  );
}
