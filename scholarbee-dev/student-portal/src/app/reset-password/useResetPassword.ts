import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { AuthApi } from '@/endpoints/auth';
import { useRouter, useSearchParams } from 'next/navigation';

const schema = z
  .object({
    newPassword: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+[\]{};':"\\|,.<>?~\-\s]{8,}$/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z
      .string()
      .min(1, 'Confirm Password is required')
      .min(8, 'Confirm Password must be at least 8 characters long')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

type FormData = z.infer<typeof schema>;

export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const {
    control,
    handleSubmit,
    watch,
    clearErrors,
    formState: { errors, isValid }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: {
      newPassword: '',
      confirmPassword: ''
    }
  });

  // Watch both password fields to clear confirmPassword error when they match
  const newPassword = watch('newPassword');
  const confirmPassword = watch('confirmPassword');

  useEffect(() => {
    // Only clear password mismatch error when passwords actually match
    if (
      errors.confirmPassword &&
      errors.confirmPassword.message === "Passwords don't match" &&
      newPassword &&
      confirmPassword &&
      newPassword === confirmPassword
    ) {
      clearErrors('confirmPassword');
    }
  }, [newPassword, confirmPassword, errors.confirmPassword, clearErrors]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    try {
      if (!token) {
        throw new Error('Token is missing or invalid');
      }
      const authApi = new AuthApi();
      const response = await authApi.resetPassword({
        password: data.newPassword,
        token
      });
      if (response.success) {
        toast.success('Password successfully reset!');
        router.push('/login');
      } else {
        toast.error(
          typeof response?.data?.message === 'string'
            ? response?.data?.message
            : (response?.data?.message[0] ?? 'Failed to reset password')
        );
      }
    } catch (error) {
      console.error('error while resetting password', error);

      toast.error('Something went wrong, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    control,
    handleSubmit,
    onSubmit,
    errors,
    loading,
    isValid
  };
};
