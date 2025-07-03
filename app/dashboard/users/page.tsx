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
import {
  Plus,
  Search,
  Edit,
  UserX,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Modal from '@/components/modal';
import AddUserForm from '@/components/forms/add-user-form';

// Mock data
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    role: 'user',
    phone: '+1234567890',
    status: 'active',
  },
  {
    id: 2,
    name: 'Jane Smith',
    role: 'admin',
    phone: '+1234567891',
    status: 'active',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    role: 'user',
    phone: '+1234567892',
    status: 'inactive',
  },
];

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [addUserOpen, setAddUserOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
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
        <h1 className='text-3xl font-bold'>Users</h1>
        <Button onClick={() => setAddUserOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Add User
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
                placeholder='Search users...'
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
                <SelectItem value='all'>All Users</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='inactive'>Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className='hidden md:block'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className='font-medium'>{user.name}</TableCell>
                    <TableCell className='capitalize'>{user.role}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Button variant='outline' size='sm'>
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button variant='outline' size='sm'>
                          <UserX className='h-4 w-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className='md:hidden space-y-4'>
            {mockUsers.map((user, index) => (
              <Card key={user.id} className='p-4'>
                <div className='flex justify-between items-start mb-3'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-muted-foreground'>
                      #{index + 1}
                    </span>
                    <h3 className='font-medium'>{user.name}</h3>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button variant='outline' size='sm'>
                      <Edit className='h-4 w-4' />
                    </Button>
                    <Button variant='outline' size='sm'>
                      <UserX className='h-4 w-4' />
                    </Button>
                  </div>
                </div>

                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Role:</span>
                    <span className='capitalize'>{user.role}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Phone:</span>
                    <span>{user.phone}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-muted-foreground'>Status:</span>
                    {getStatusBadge(user.status)}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className='flex items-center justify-between space-x-2 py-4'>
            <div className='text-sm text-muted-foreground'>
              Showing 1 to {mockUsers.length} of {mockUsers.length} results
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
      <Modal isOpen={addUserOpen} setIsOpen={setAddUserOpen}>
        <AddUserForm />
      </Modal>
    </div>
  );
}
