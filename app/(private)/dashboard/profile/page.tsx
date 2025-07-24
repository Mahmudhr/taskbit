'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Phone,
  Calendar,
  Save,
  Upload,
  MessageCircle,
  CreditCard,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useUserProfile } from '@/hooks/use-user';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    email: '',
    password: '',
    phone: '',
    whatsapp: '',
    bkashNumber: '',
    nagadNumber: '',
    bankAccountNumber: '',
    branchName: '',
    bankName: '',
    swiftCode: '',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '',
    updatedAt: '',
    isDeleted: false,
    avatar: '/placeholder.svg?height=100&width=100',
  });

  // Get user ID from session
  const userId = session?.user?.id ? parseInt(session.user.id as string) : 0;

  // Fetch user profile using the hook
  const { userProfile, fetchUserProfileQuery, updateProfileAsync } =
    useUserProfile(userId);

  // Set form data when user profile is fetched
  useEffect(() => {
    if (userProfile) {
      setFormData({
        id: userProfile.id,
        name: userProfile.name || '',
        email: userProfile.email || '',
        password: '********', // Default masked password
        phone: userProfile.phone || '',
        whatsapp: userProfile.whatsapp || '',
        bkashNumber: userProfile.bkashNumber || '',
        nagadNumber: userProfile.nagadNumber || '',
        bankAccountNumber: userProfile.bankAccountNumber || '',
        branchName: userProfile.branchName || '',
        bankName: userProfile.bankName || '',
        swiftCode: userProfile.swiftCode || '',
        role: userProfile.role || 'USER',
        status: userProfile.status || 'ACTIVE',
        createdAt: userProfile.createdAt
          ? new Date(userProfile.createdAt).toISOString().split('T')[0]
          : '',
        updatedAt: userProfile.updatedAt
          ? new Date(userProfile.updatedAt).toISOString().split('T')[0]
          : '',
        isDeleted: userProfile.isDeleted || false,
        avatar: session?.user?.image || '/placeholder.svg?height=100&width=100',
      });
    }
  }, [userProfile, session?.user?.image]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      // Prepare update data (exclude fields that shouldn't be updated)
      const updateData: {
        name?: string;
        phone?: string;
        whatsapp?: string;
        bkashNumber?: string;
        nagadNumber?: string;
        bankAccountNumber?: string;
        branchName?: string;
        bankName?: string;
        swiftCode?: string;
        password?: string;
      } = {};

      // Only include fields that have values and are different from original
      if (formData.name && formData.name !== userProfile?.name)
        updateData.name = formData.name;
      if (formData.phone !== userProfile?.phone)
        updateData.phone = formData.phone;
      if (formData.whatsapp !== userProfile?.whatsapp)
        updateData.whatsapp = formData.whatsapp;
      if (formData.bkashNumber !== userProfile?.bkashNumber)
        updateData.bkashNumber = formData.bkashNumber;
      if (formData.nagadNumber !== userProfile?.nagadNumber)
        updateData.nagadNumber = formData.nagadNumber;
      if (formData.bankAccountNumber !== userProfile?.bankAccountNumber)
        updateData.bankAccountNumber = formData.bankAccountNumber;
      if (formData.branchName !== userProfile?.branchName)
        updateData.branchName = formData.branchName;
      if (formData.bankName !== userProfile?.bankName)
        updateData.bankName = formData.bankName;
      if (formData.swiftCode !== userProfile?.swiftCode)
        updateData.swiftCode = formData.swiftCode;

      // Only update password if it's been changed (not the masked value)
      if (formData.password && formData.password !== '********') {
        updateData.password = formData.password;
      }

      // Check if there are any changes to update
      if (Object.keys(updateData).length === 0) {
        toast.info('No changes to save');
        setIsEditing(false);
        return;
      }

      // Show loading toast
      toast.promise(updateProfileAsync(updateData), {
        loading: 'Updating profile...',
        success: (data) => {
          setIsEditing(false);
          setShowPassword(false);
          return data.message || 'Profile updated successfully';
        },
        error: (error) => getErrorMessage(error) || 'Failed to update profile',
      });
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    // Reset form data to fetched user data
    if (userProfile) {
      setFormData({
        id: userProfile.id,
        name: userProfile.name || '',
        email: userProfile.email || '',
        password: '********',
        phone: userProfile.phone || '',
        whatsapp: userProfile.whatsapp || '',
        bkashNumber: userProfile.bkashNumber || '',
        nagadNumber: userProfile.nagadNumber || '',
        bankAccountNumber: userProfile.bankAccountNumber || '',
        branchName: userProfile.branchName || '',
        bankName: userProfile.bankName || '',
        swiftCode: userProfile.swiftCode || '',
        role: userProfile.role || 'USER',
        status: userProfile.status || 'ACTIVE',
        createdAt: userProfile.createdAt
          ? new Date(userProfile.createdAt).toISOString().split('T')[0]
          : '',
        updatedAt: userProfile.updatedAt
          ? new Date(userProfile.updatedAt).toISOString().split('T')[0]
          : '',
        isDeleted: userProfile.isDeleted || false,
        avatar: session?.user?.image || '/placeholder.svg?height=100&width=100',
      });
    }
    setIsEditing(false);
    setShowPassword(false);
  };

  const initials =
    session?.user.name &&
    session?.user.name
      .split(' ')
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  // Show loading state while session or profile is loading
  if (!session || fetchUserProfileQuery.isLoading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-xl md:text-3xl font-bold tracking-tight'>
              My Profile
            </h1>
            <p className='text-muted-foreground'>
              Loading profile information...
            </p>
          </div>
        </div>
        <Card>
          <CardContent className='p-6'>
            <div className='animate-pulse space-y-4'>
              <div className='h-4 bg-gray-200 rounded w-1/4'></div>
              <div className='h-4 bg-gray-200 rounded w-1/2'></div>
              <div className='h-4 bg-gray-200 rounded w-3/4'></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state if profile fetch failed
  if (fetchUserProfileQuery.isError) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-xl md:text-3xl font-bold tracking-tight'>
              My Profile
            </h1>
            <p className='text-muted-foreground'>
              Error loading profile information
            </p>
          </div>
        </div>
        <Card>
          <CardContent className='p-6'>
            <div className='text-center text-red-600'>
              Failed to load profile data. Please try again.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl md:text-3xl font-bold tracking-tight'>
            My Profile
          </h1>
          <p className='text-muted-foreground'>
            Manage your account settings and preferences
          </p>
        </div>
        <div className='flex gap-2'>
          {isEditing ? (
            <>
              <Button variant='outline' onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className='mr-2 h-4 w-4' />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        {/* Profile Overview */}
        <Card className='md:col-span-1'>
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='flex flex-col items-center space-y-4'>
              <div className='relative'>
                <Avatar className='h-20 w-20 mr-2'>
                  <AvatarFallback className='text-2xl bg-gray-200 dark:text-gray-700'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size='sm'
                    variant='outline'
                    className='absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-transparent'
                  >
                    <Upload className='h-4 w-4' />
                  </Button>
                )}
              </div>
              <div className='text-center'>
                <h3 className='text-lg font-semibold'>{formData.name}</h3>
                <p className='text-sm text-muted-foreground'>
                  {formData.email}
                </p>
                <div className='flex gap-2 justify-center'>
                  <Badge variant='secondary' className='mt-2'>
                    {formData.role}
                  </Badge>
                  <Badge
                    variant={
                      formData.status === 'ACTIVE' ? 'default' : 'secondary'
                    }
                    className='mt-1'
                  >
                    {formData.status}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className='space-y-4'>
              <div className='flex items-center gap-3'>
                <Phone className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm'>
                  {formData.phone || 'Not provided'}
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <MessageCircle className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm'>
                  {formData.whatsapp || 'Not provided'}
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <Calendar className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm'>
                  Joined{' '}
                  {formData.createdAt
                    ? new Date(formData.createdAt).toLocaleDateString()
                    : 'Unknown'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className='md:col-span-2'>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Basic Information */}
            <div className='space-y-4'>
              <h4 className='text-sm font-medium'>Basic Information</h4>

              <div className='space-y-2'>
                <Label htmlFor='name'>Full Name</Label>
                <Input
                  id='name'
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                  placeholder='Enter your full name'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='email'>Email Address</Label>
                <Input
                  id='email'
                  type='email'
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={true}
                  className='bg-muted'
                  placeholder='your.email@example.com'
                />
                <p className='text-xs text-muted-foreground'>
                  Email cannot be changed
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='password'>Password</Label>
                <div className='relative'>
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange('password', e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder='Enter new password'
                  />
                  {isEditing && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className='h-4 w-4' />
                      ) : (
                        <Eye className='h-4 w-4' />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='phone'>Phone Number</Label>
                  <Input
                    id='phone'
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    placeholder='+1234567890'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='whatsapp'>WhatsApp Number</Label>
                  <Input
                    id='whatsapp'
                    value={formData.whatsapp}
                    onChange={(e) =>
                      handleInputChange('whatsapp', e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder='+1234567890'
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment Information */}
            <div className='space-y-4'>
              <h4 className='text-sm font-medium flex items-center gap-2'>
                <CreditCard className='h-4 w-4' />
                Payment Information
              </h4>

              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='bkashNumber'>Bkash Number</Label>
                  <Input
                    id='bkashNumber'
                    value={formData.bkashNumber}
                    onChange={(e) =>
                      handleInputChange('bkashNumber', e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder='01XXXXXXXXX'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='nagadNumber'>Nagad Number</Label>
                  <Input
                    id='nagadNumber'
                    value={formData.nagadNumber}
                    onChange={(e) =>
                      handleInputChange('nagadNumber', e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder='01XXXXXXXXX'
                  />
                </div>
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='bankAccountNumber'>Bank Account Number</Label>
                  <Input
                    id='bankAccountNumber'
                    value={formData.bankAccountNumber}
                    onChange={(e) =>
                      handleInputChange('bankAccountNumber', e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder='1234567890'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='bankName'>Bank Name</Label>
                  <Input
                    id='bankName'
                    value={formData.bankName}
                    onChange={(e) =>
                      handleInputChange('bankName', e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder='Example Bank'
                  />
                </div>
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='branchName'>Branch Name</Label>
                  <Input
                    id='branchName'
                    value={formData.branchName}
                    onChange={(e) =>
                      handleInputChange('branchName', e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder='Main Branch'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='swiftCode'>Swift Code</Label>
                  <Input
                    id='swiftCode'
                    value={formData.swiftCode}
                    onChange={(e) =>
                      handleInputChange('swiftCode', e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder='EXBKUS33'
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
