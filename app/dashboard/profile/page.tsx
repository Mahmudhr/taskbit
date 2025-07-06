'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Phone, MapPin, Calendar, Save, Upload } from 'lucide-react';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    role: 'admin',
    department: 'IT',
    location: 'New York, USA',
    bio: 'Experienced project manager with 5+ years in task management and team coordination.',
    joinDate: '2023-01-15',
    avatar: '/placeholder.svg?height=100&width=100',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data or fetch from server
    setIsEditing(false);
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>My Profile</h1>
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
                <Avatar className='h-24 w-24'>
                  <AvatarImage
                    src={formData.avatar || '/placeholder.svg'}
                    alt='Profile'
                  />
                  <AvatarFallback className='text-lg'>
                    {formData.firstName[0]}
                    {formData.lastName[0]}
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
                <h3 className='text-lg font-semibold'>
                  {formData.firstName} {formData.lastName}
                </h3>
                <p className='text-sm text-muted-foreground'>
                  {formData.email}
                </p>
                <Badge variant='secondary' className='mt-2'>
                  {formData.role}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className='space-y-4'>
              <div className='flex items-center gap-3'>
                <Phone className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm'>{formData.phone}</span>
              </div>
              <div className='flex items-center gap-3'>
                <MapPin className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm'>{formData.location}</span>
              </div>
              <div className='flex items-center gap-3'>
                <Calendar className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm'>
                  Joined {new Date(formData.joinDate).toLocaleDateString()}
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
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='firstName'>First Name</Label>
                <Input
                  id='firstName'
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange('firstName', e.target.value)
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='lastName'>Last Name</Label>
                <Input
                  id='lastName'
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange('lastName', e.target.value)
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email'>Email Address</Label>
              <Input
                id='email'
                type='email'
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='phone'>Phone Number</Label>
                <Input
                  id='phone'
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='department'>Department</Label>
                <Input
                  id='department'
                  value={formData.department}
                  onChange={(e) =>
                    handleInputChange('department', e.target.value)
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='role'>Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='admin'>Admin</SelectItem>
                    <SelectItem value='user'>User</SelectItem>
                    <SelectItem value='manager'>Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='location'>Location</Label>
                <Input
                  id='location'
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange('location', e.target.value)
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='bio'>Bio</Label>
              <Textarea
                id='bio'
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!isEditing}
                rows={4}
                placeholder='Tell us about yourself...'
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-4'>
            <div className='text-center p-4 border rounded-lg'>
              <div className='text-2xl font-bold text-primary'>24</div>
              <div className='text-sm text-muted-foreground'>
                Tasks Completed
              </div>
            </div>
            <div className='text-center p-4 border rounded-lg'>
              <div className='text-2xl font-bold text-primary'>8</div>
              <div className='text-sm text-muted-foreground'>Active Tasks</div>
            </div>
            <div className='text-center p-4 border rounded-lg'>
              <div className='text-2xl font-bold text-primary'>$2,450</div>
              <div className='text-sm text-muted-foreground'>
                Total Earnings
              </div>
            </div>
            <div className='text-center p-4 border rounded-lg'>
              <div className='text-2xl font-bold text-primary'>95%</div>
              <div className='text-sm text-muted-foreground'>Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
