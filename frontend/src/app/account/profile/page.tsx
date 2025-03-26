'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateUserMutation } from '@/store/api';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setUser, toggleLoginDialog } from '@/store/slices/userSlice';
import toast from 'react-hot-toast';
import NoData from '@/lib/NoData';
import { UserData } from '@/types/type';



export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const router = useRouter();

  // Initialize useForm with default values from the user state
  const { register, handleSubmit, reset } = useForm<UserData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
    },
  });

  // Reset form data when user or isEditing changes
  useEffect(() => {
    reset({
      name: user?.name || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
    });
  }, [user, isEditing, reset]);

  const handleProfileEdit = async (data: UserData) => {
    const { name, email, phoneNumber } = data;
    try {
      const result = await updateUser({userId: user._id, userData: { name, email, phoneNumber }}).unwrap();
      if (result.success && result.data) {
        dispatch(setUser(result.data));
        setIsEditing(false);
        toast.success(result.message || 'Profile updated successfully');
      } else {
        throw new Error(result.message || 'An unknown error occurred');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update user profile');
    }
  };




  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-2">My Profile</h1>
        <p className="text-pink-100">
          Manage your personal information and preferences
        </p>
      </div>
      <Card className="border-t-4 border-t-pink-500 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50">
          <CardTitle className="text-2xl text-pink-700">Personal Information</CardTitle>
          <CardDescription>
            Update your profile details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <form onSubmit={handleSubmit(handleProfileEdit)}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="username"
                    placeholder="John"
                    disabled={!isEditing}
                    className="pl-10"
                    {...register('name')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    placeholder="john.doe@example.com"
                    type="email"
                    disabled={!isEditing}
                    className="pl-10"
                    {...register('email')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="phoneNumber"
                    placeholder="+1 234 567 890"
                    type="tel"
                    disabled={!isEditing}
                    className="pl-10"
                    {...register('phoneNumber')}
                  />
                </div>
              </div>
            </div>
            <CardFooter className="bg-pink-50 mt-4 flex justify-between">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setIsEditing(false);
                      reset(); // Reset form values to initial state
                    }}
                  >
                    Discard Changes
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r mt-4 from-pink-500 to-rose-500 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r mt-4 from-pink-500 to-rose-500 text-white"
                >
                  Edit Profile
                </Button>
              )}
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
