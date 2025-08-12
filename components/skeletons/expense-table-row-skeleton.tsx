import { Skeleton } from '../ui/skeleton';
import { TableCell, TableRow } from '../ui/table';

export default function ExpenseTableRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className='h-4 w-12' />
      </TableCell>
      <TableCell>
        <Skeleton className='h-4 w-32' />
      </TableCell>
      <TableCell>
        <Skeleton className='h-4 w-20' />
      </TableCell>
      <TableCell>
        <Skeleton className='h-4 w-28' />
      </TableCell>
      <TableCell>
        <Skeleton className='h-4 w-28' />
      </TableCell>
      <TableCell>
        <Skeleton className='h-8 w-8' />
      </TableCell>
    </TableRow>
  );
}
