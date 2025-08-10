'use client';

import { useState, useMemo } from 'react';
import { useFetchAllSalaries } from '@/hooks/use-salary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Search,
  Filter,
  Calendar,
  User,
  Copy,
  Check,
  Grid3X3,
  List,
} from 'lucide-react';
import {
  cn,
  salaryStatusConvert,
  salaryTypeConvert,
  paymentTypeConvert,
} from '@/lib/utils';
import { $Enums } from '@prisma/client';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { SalaryType, UserType } from '@/types/common';

// Status badge component
const getStatusBadge = (status: $Enums.SalaryStatus) => {
  const variants = {
    PENDING: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    PAID: 'bg-green-100 text-green-800 hover:bg-green-200',
    CANCELLED: 'bg-red-100 text-red-800 hover:bg-red-200',
  } as const;
  return (
    <Badge className={cn(variants[status])}>
      {salaryStatusConvert[status]}
    </Badge>
  );
};

// Salary type badge component
const getSalaryTypeBadge = (type: $Enums.SalaryType) => {
  const variants = {
    MONTHLY: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    BONUS: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    OVERTIME: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  } as const;
  return (
    <Badge className={cn(variants[type])}>{salaryTypeConvert[type]}</Badge>
  );
};

// Payment type badge component
const getPaymentTypeBadge = (type: $Enums.PaymentType) => {
  const variants = {
    BANK_TRANSFER: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
    BKASH: 'bg-pink-100 text-pink-800 hover:bg-pink-200',
    NAGAD: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200',
  } as const;
  return (
    <Badge className={cn(variants[type])}>{paymentTypeConvert[type]}</Badge>
  );
};

// Salary card component for mobile view
const SalaryCard = ({
  salary,
}: {
  salary: Omit<SalaryType, 'user'> & { user: Partial<UserType> };
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`${fieldName} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <Card className='mb-4'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg'>Salary #{salary.id}</CardTitle>
          <div className='text-right'>
            <div className='text-lg font-semibold text-green-600'>
              ৳ {salary.amount.toLocaleString()}
            </div>
            <div className='text-xs text-muted-foreground'>
              {monthNames[salary.month - 1]} {salary.year}
            </div>
          </div>
        </div>
        <div className='flex flex-wrap gap-2 mt-2'>
          {getStatusBadge(salary.status)}
          {getSalaryTypeBadge(salary.salaryType)}
          {getPaymentTypeBadge(salary.paymentType)}
        </div>
      </CardHeader>
      <CardContent className='space-y-3'>
        {/* Employee Info */}
        <div className='flex items-center gap-2 p-2 bg-blue-50 rounded'>
          <User className='h-4 w-4 text-blue-600' />
          <div>
            <div className='font-medium text-sm'>{salary.user.name}</div>
            <div className='text-xs text-muted-foreground'>
              {salary.user.email}
            </div>
          </div>
        </div>

        {/* Reference Number */}
        {salary.referenceNumber && (
          <div className='flex items-center justify-between p-2 bg-muted rounded'>
            <div>
              <div className='text-xs font-medium text-muted-foreground'>
                Reference
              </div>
              <div className='text-sm'>{salary.referenceNumber}</div>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() =>
                handleCopy(salary.referenceNumber ?? '', 'Reference Number')
              }
              className='h-6 w-6 p-0'
            >
              {copiedField === 'Reference Number' ? (
                <Check className='h-3 w-3 text-green-600' />
              ) : (
                <Copy className='h-3 w-3' />
              )}
            </Button>
          </div>
        )}

        {/* Date */}
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Calendar className='h-4 w-4' />
          <span>
            Created: {dayjs(salary.createdAt).format('DD MMM YYYY, h:mm A')}
          </span>
        </div>

        {/* Note */}
        {salary.note && (
          <div className='p-2 bg-gray-50 rounded'>
            <div className='text-xs font-medium text-muted-foreground mb-1'>
              Note
            </div>
            <div className='text-sm'>{salary.note}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function SalariesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [salaryTypeFilter, setSalaryTypeFilter] = useState('ALL');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const { data: allSalaries, isLoading, error } = useFetchAllSalaries();

  // Calculate summary stats
  const stats = useMemo(() => {
    if (!allSalaries?.data.length)
      return { total: 0, paid: 0, pending: 0, cancelled: 0 };

    return {
      total: allSalaries?.data.length,
      paid: allSalaries?.data.filter((s) => s.status === 'PAID').length,
      pending: allSalaries?.data.filter((s) => s.status === 'PENDING').length,
      cancelled: allSalaries?.data.filter((s) => s.status === 'CANCELLED')
        .length,
      totalAmount: allSalaries?.data.reduce(
        (sum, s) => (s.status === 'PAID' ? sum + s.amount : sum),
        0
      ),
    };
  }, [allSalaries?.data]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p>Loading salaries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-8'>
        <p className='text-red-600'>
          Error loading salaries. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-3 md:space-y-6 p-2 md:p-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>All Salaries</h1>
          <p className='text-muted-foreground'>
            Manage and view all employee salary records
          </p>
        </div>

        {/* View Toggle - Mobile/Desktop */}
        <div className='flex items-center gap-2'>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setViewMode('table')}
            className='hidden sm:flex'
          >
            <List className='h-4 w-4 mr-2' />
            Table
          </Button>
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setViewMode('cards')}
          >
            <Grid3X3 className='h-4 w-4 mr-2' />
            Cards
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
        <Card>
          <CardContent className='p-4 text-center'>
            <div className='text-2xl font-bold'>{stats.total}</div>
            <div className='text-xs text-muted-foreground'>Total Entries</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <div className='text-2xl font-bold text-green-600'>
              {stats.paid}
            </div>
            <div className='text-xs text-muted-foreground'>Paid</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <div className='text-2xl font-bold text-yellow-600'>
              {stats.pending}
            </div>
            <div className='text-xs text-muted-foreground'>Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <div className='text-2xl font-bold text-red-600'>
              {stats.cancelled}
            </div>
            <div className='text-xs text-muted-foreground'>Cancelled</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <div className='text-lg font-bold text-green-600'>
              ৳ {(stats.totalAmount ?? 0).toLocaleString()}
            </div>
            <div className='text-xs text-muted-foreground'>Total Paid</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex flex-col sm:flex-row gap-4'>
            {/* Search */}
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search by name, email, reference, or ID...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>

            {/* Filters */}
            <div className='flex flex-col sm:flex-row gap-2'>
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className='w-full sm:w-[140px]'>
                  <SelectValue placeholder='Status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>All Status</SelectItem>
                  <SelectItem value='PENDING'>Pending</SelectItem>
                  <SelectItem value='PAID'>Paid</SelectItem>
                  <SelectItem value='CANCELLED'>Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* Salary Type Filter */}
              <Select
                value={salaryTypeFilter}
                onValueChange={setSalaryTypeFilter}
              >
                <SelectTrigger className='w-full sm:w-[140px]'>
                  <SelectValue placeholder='Type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>All Types</SelectItem>
                  <SelectItem value='MONTHLY'>Monthly</SelectItem>
                  <SelectItem value='BONUS'>Bonus</SelectItem>
                  <SelectItem value='OVERTIME'>Overtime</SelectItem>
                </SelectContent>
              </Select>

              {/* Payment Type Filter */}
              <Select
                value={paymentTypeFilter}
                onValueChange={setPaymentTypeFilter}
              >
                <SelectTrigger className='w-full sm:w-[140px]'>
                  <SelectValue placeholder='Payment' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>All Payments</SelectItem>
                  <SelectItem value='BANK_TRANSFER'>Bank Transfer</SelectItem>
                  <SelectItem value='BKASH'>Bkash</SelectItem>
                  <SelectItem value='NAGAD'>Nagad</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              <Button
                variant='outline'
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                  setSalaryTypeFilter('ALL');
                  setPaymentTypeFilter('ALL');
                }}
                className='w-full sm:w-auto'
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {allSalaries?.data.length === 0 ? (
        <Card>
          <CardContent className='p-8 text-center'>
            <div className='text-muted-foreground'>
              <Filter className='h-12 w-12 mx-auto mb-4 opacity-50' />
              <p className='text-lg font-medium mb-2'>No salaries found</p>
              <p className='text-sm'>
                Try adjusting your search terms or filters
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          {viewMode === 'table' && (
            <Card className='hidden sm:block'>
              <CardContent className='p-0'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allSalaries?.data.map((salary) => (
                      <TableRow key={salary.id}>
                        <TableCell className='font-medium'>
                          #{salary.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className='font-medium'>
                              {salary.user.name}
                            </div>
                            <div className='text-xs text-muted-foreground'>
                              {salary.user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='font-semibold text-green-600'>
                          ৳ {salary.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {new Date(0, salary.month - 1).toLocaleString(
                            'default',
                            { month: 'short' }
                          )}{' '}
                          {salary.year}
                        </TableCell>
                        <TableCell>
                          {getSalaryTypeBadge(salary.salaryType)}
                        </TableCell>
                        <TableCell>
                          {getPaymentTypeBadge(salary.paymentType)}
                        </TableCell>
                        <TableCell>{getStatusBadge(salary.status)}</TableCell>
                        <TableCell className='text-xs'>
                          {salary.referenceNumber || '-'}
                        </TableCell>
                        <TableCell className='text-xs'>
                          {dayjs(salary.createdAt).format('DD/MM/YY')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Mobile Card View */}
          {(viewMode === 'cards' || window.innerWidth < 640) && (
            <div className='space-y-4'>
              {allSalaries?.data.map((salary) => (
                <SalaryCard key={salary.id} salary={salary} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
