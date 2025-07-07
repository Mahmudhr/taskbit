'use client';

import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data for user's tasks
const mockMyTasks = [
  {
    id: 1,
    title: 'Design Homepage',
    dueDate: '2024-01-15',
    link: 'https://example.com/task1',
    amount: 500,
    status: 'pending',
  },
  {
    id: 2,
    title: 'Create Logo',
    dueDate: '2024-01-20',
    link: 'https://example.com/task2',
    amount: 300,
    status: 'complete',
  },
];

export default function MyTasksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      incomplete: 'destructive',
      complete: 'default',
      'time over': 'destructive',
    } as const;
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl md:text-3xl font-bold'>My Tasks</h1>
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
                placeholder='Search my tasks...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-8'
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Filter by status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='pending'>Pending</SelectItem>
                <SelectItem value='incomplete'>Incomplete</SelectItem>
                <SelectItem value='complete'>Complete</SelectItem>
                <SelectItem value='time over'>Time Over</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Filter by time' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Time</SelectItem>
                <SelectItem value='last-day'>Last Day</SelectItem>
                <SelectItem value='last-week'>Last Week</SelectItem>
                <SelectItem value='last-month'>Last Month</SelectItem>
                <SelectItem value='last-6months'>Last 6 Months</SelectItem>
                <SelectItem value='last-year'>Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Tasks List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className='hidden md:block'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial</TableHead>
                  <TableHead>Task Title</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockMyTasks.map((task, index) => (
                  <TableRow key={task.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className='font-medium'>{task.title}</TableCell>
                    <TableCell>{task.dueDate}</TableCell>
                    <TableCell>
                      <a
                        href={task.link}
                        className='text-blue-600 hover:underline'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        View Link
                      </a>
                    </TableCell>
                    <TableCell>${task.amount}</TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell>
                      <Button variant='outline' size='sm'>
                        <Upload className='h-4 w-4 mr-1' />
                        Deliver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className='md:hidden space-y-4'>
            {mockMyTasks.map((task, index) => (
              <Card key={task.id} className='p-4'>
                <div className='flex justify-between items-start mb-3'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-muted-foreground'>
                      #{index + 1}
                    </span>
                    <h3 className='font-medium'>{task.title}</h3>
                  </div>
                  <Button variant='outline' size='sm'>
                    <Upload className='h-4 w-4 mr-1' />
                    Deliver
                  </Button>
                </div>

                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Due Date:</span>
                    <span>{task.dueDate}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Amount:</span>
                    <span className='font-medium'>${task.amount}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-muted-foreground'>Status:</span>
                    {getStatusBadge(task.status)}
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Link:</span>
                    <a
                      href={task.link}
                      className='text-blue-600 hover:underline text-sm'
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      View Link
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className='flex items-center justify-between space-x-2 py-4'>
            <div className='text-sm text-muted-foreground'>
              Showing 1 to {mockMyTasks.length} of {mockMyTasks.length} results
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
