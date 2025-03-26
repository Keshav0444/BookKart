'use client'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useResetPasswordMutation } from '@/store/api'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { toggleLoginDialog } from '@/store/slices/userSlice'

interface ResetPasswordFormData {
  token: string
  newPassword: string
  confirmPassword: string
}

const ResetPassword: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetPassword] = useResetPasswordMutation()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordFormData>()

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    try {
      await resetPassword({ token: token, newPassword: data.newPassword }).unwrap()
      setResetSuccess(true)
      toast.success('Password reset successful')
    } catch (error) {
      toast.error('Failed to reset password. Please try again.')
    }
  }

  const handleOpenLogin = () => {
    dispatch(toggleLoginDialog());
  };

  return (
    <div className="p-20 flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
      >
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">Reset Your Password</h2>
        {!resetSuccess ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <Input
                {...register('newPassword', { required: 'New password is required' })}
                placeholder="New Password"
                type={showPassword ? 'text' : 'password'}
                className="pl-10 pr-10"
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
              {showPassword ? (
                <EyeOff
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                  size={20}
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <Eye
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                  size={20}
                  onClick={() => setShowPassword(true)}
                />
              )}
            </div>
            {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword.message}</p>}
            <Input
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === watch('newPassword') || "Passwords don't match"
              })}
              placeholder="Confirm New Password"
              type="password"
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105">
              Reset Password
            </Button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-semibold text-gray-700">Password Reset Successful</h3>
            <p className="text-gray-500">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            <Button onClick={handleOpenLogin} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105">
              Go to Login
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default ResetPassword