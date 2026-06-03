import React, { useCallback, useRef, useState } from 'react';
import { ReadonlyURLSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { AuthApi } from '@/endpoints/auth';
import { LoginFormData, loginSchema } from './schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { setAuth } from '@/redux/slices/authSlice';
import { setAuthTokens, setUserData } from '@/utils/cookieManager';

export const useLogin = (searchParams: ReadonlyURLSearchParams) => {
  const [loading, setLoading] = useState(false);
  const authApiRef = useRef(new AuthApi());
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setError
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const handleRedirect = useCallback(() => {
    try {
      const redirectUrl = searchParams.get('redirect') || '/';
      const decodedUrl = decodeURIComponent(redirectUrl);

      toast.success('Logged in successfully');

      // Use window.location.href to force a hard reload so that Next.js middleware and server-side logic
      // picks up the newly set cookies properly, avoiding cached unauthenticated states.
      if (decodedUrl.startsWith('/') && !decodedUrl.startsWith('//')) {
        window.location.href = decodedUrl;
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Redirect error:', error);
      window.location.href = '/';
    }
  }, [searchParams]);

  const login = useCallback(
    async (data: LoginFormData) => {
      try {
        setLoading(true);
        const response = await authApiRef.current.login(data);

        if (response?.success) {
          const { token, refreshToken, user, accessToken } = response.data;

          setAuthTokens({ token: accessToken ?? token, refreshToken });
          setUserData(user?._id);

          dispatch(setAuth({ token, refreshToken, user }));

          handleRedirect();
          // We don't set loading to false here to keep the loader until redirection
          return;
        } else {
          setLoading(false);
          throw new Error(
            (response?.data as { message?: string })?.message ?? 'Login failed'
          );
        }
      } catch (error) {
        setLoading(false);
        const errorMessage =
          (error as Error)?.message || 'Error while logging in';
        toast.error(errorMessage);
        setError('root', {
          type: 'manual',
          message: 'Invalid credentials or server error'
        });
      }
    },
    [dispatch, handleRedirect, setError]
  );

  const onSubmit = useCallback(
    (e?: React.BaseSyntheticEvent) => {
      e?.preventDefault?.();
      return handleSubmit(login)(e);
    },
    [handleSubmit, login]
  );

  return {
    login,
    loading,
    errors,
    control,
    handleSubmit: onSubmit,
    isValid
  };
};
