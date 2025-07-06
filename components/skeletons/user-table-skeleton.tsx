import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserTableSkeleton() {
  return (
    <div className='hidden md:block'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Serial</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className='h-4 w-8' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-4 w-24' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-4 w-32' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-4 w-16' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-4 w-20' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-4 w-16' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-8 w-20' />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
