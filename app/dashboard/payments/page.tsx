'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data
const mockPayments: Payment[] = [
  {
    id: 1,
    trxId: 'TXN001',
    amount: 500,
    taskTitle: 'Design Homepage',
    status: 'paid',
  },
  {
    id: 2,
    trxId: 'TXN002',
    amount: 1200,
    taskTitle: 'Develop API',
    status: 'pending',
  },
  {
    id: 3,
    trxId: 'TXN003',
    amount: 300,
    taskTitle: 'Write Documentation',
    status: 'due',
  },
];

type PaymentStatus = 'paid' | 'pending' | 'due';
type Payment = {
  id: number;
  trxId: string;
  amount: number;
  taskTitle: string;
  status: PaymentStatus;
};

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const getStatusBadge = (status: PaymentStatus) => {
    const variants = {
      paid: 'default',
      pending: 'secondary',
      due: 'destructive',
    } as const;
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Payments Management</h1>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Add Payment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-4 md:flex-row md:items-center'>
            <div className='relative flex-1'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search payments...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-8'
              />
            </div>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Filter payments' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Payments</SelectItem>
                <SelectItem value='due'>Due Payments</SelectItem>
                <SelectItem value='paid'>Paid</SelectItem>
                <SelectItem value='pending'>Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Filter by time' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Time</SelectItem>
                <SelectItem value='last-week'>Last Week</SelectItem>
                <SelectItem value='last-month'>Last Month</SelectItem>
                <SelectItem value='last-6months'>Last 6 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payments List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className='hidden md:block'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Task Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPayments.map((payment, index) => (
                  <TableRow key={payment.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className='font-medium'>
                      {payment.trxId}
                    </TableCell>
                    <TableCell>${payment.amount}</TableCell>
                    <TableCell>{payment.taskTitle}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      <Button variant='outline' size='sm'>
                        <Edit className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className='md:hidden space-y-4'>
            {mockPayments.map((payment, index) => (
              <Card key={payment.id} className='p-4'>
                <div className='flex justify-between items-start mb-3'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-muted-foreground'>
                      #{index + 1}
                    </span>
                    <span className='font-medium'>{payment.trxId}</span>
                  </div>
                  <Button variant='outline' size='sm'>
                    <Edit className='h-4 w-4' />
                  </Button>
                </div>

                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Amount:</span>
                    <span className='font-medium'>${payment.amount}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Task:</span>
                    <span>{payment.taskTitle}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-muted-foreground'>Status:</span>
                    {getStatusBadge(payment.status)}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className='flex items-center justify-between space-x-2 py-4'>
            <div className='text-sm text-muted-foreground'>
              Showing 1 to {mockPayments.length} of {mockPayments.length}{' '}
              results
            </div>
            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className='h-4 w-4' />
                Previous
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
