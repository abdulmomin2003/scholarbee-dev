import { AuthApi } from '@/endpoints/auth';
import { setAuth } from '@/redux/slices/authSlice';
import { DiscoveryMode } from '@/types';
import { User } from '@/types/authTypes';
import { setAuthTokens, setUserData } from '@/utils/cookieManager';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReadonlyURLSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { FormData, schema } from './schema';

type SessionPayload = {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: User & { _id?: string };
};

export const useSignUpForm = (searchParams: ReadonlyURLSearchParams) => {
  const [loading, setLoading] = useState<boolean>(false);

  const authApi = new AuthApi();
  const dispatch = useDispatch();

  const handleRedirect = useCallback(() => {
    try {
      const redirectUrl = searchParams.get('redirect');
      const onboardUrl = redirectUrl
        ? `/onboarding?redirect=${encodeURIComponent(redirectUrl)}`
        : '/onboarding';

      // Allow access to onboarding route
      sessionStorage.setItem('from_signup', 'true');

      toast.success('Account created successfully');
      window.location.href = onboardUrl;
    } catch (error) {
      console.error('Redirect error:', error);
      window.location.href = '/onboarding';
    }
  }, [searchParams]);

  const completeSessionAndGoHome = useCallback(
    (data: SessionPayload) => {
      const resolvedToken = data.accessToken ?? data.token;
      if (!resolvedToken) {
        return false;
      }

      const { token, refreshToken, user } = data;

      setAuthTokens({ token: resolvedToken, refreshToken: refreshToken ?? '' });
      setUserData(user?._id ?? user?.id);

      dispatch(
        setAuth({
          token: token ?? resolvedToken,
          refreshToken: refreshToken ?? null,
          user: user ?? null
        })
      );

      handleRedirect();
      return true;
    },
    [dispatch, handleRedirect]
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
    watch
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: {
      // first_name: '',
      // last_name: '',
      full_name: '',
      phone_number: '',
      email: '',
      password: '',
      confirmPassword: '',
      referralSource: undefined,
      referralCode: ''
      // agree: false
    }
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);

    try {
      // Build discovery_info object
      let discovery_info = undefined;
      if (data.referralSource) {
        if (data.referralSource === DiscoveryMode.Invitation) {
          discovery_info = {
            discovery_mode: DiscoveryMode.Invitation,
            invitation_code: data.referralCode?.trim() || ''
          };
        } else {
          discovery_info = {
            discovery_mode: data.referralSource
          };
        }
      }

      const requestData = {
        full_name: data.full_name,
        // first_name: data.first_name,
        // last_name: data.last_name,
        phone_number: data.phone_number,
        email: data.email,
        password: data.password,
        user_type: 'Student',
        // accepted_legal_documents: data.agree
        //   ? ['69ae85fdd97261f099caf56e', '69ae8443d97261f099caf3a9']
        //   : [],
        ...(discovery_info && { discovery_info })
      };
      const response = await authApi.signUp(requestData);
      if (response.success && response.data) {
        const signedIn = completeSessionAndGoHome(
          response.data as SessionPayload
        );

        if (!signedIn) {
          toast.info(
            response.message ??
              'Account created, but we could not start your session. Please sign in.'
          );
        }
      } else {
        console.log({ response });
        const errorData = response?.data || response;
        const msg = errorData?.message || response?.message;

        const errorMsg =
          (Array.isArray(msg) ? msg.join(', ') : msg) ||
          errorData?.error ||
          response?.error ||
          'Something went wrong. Please try again.';
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Error during sign up:', error);
      toast.error('An error occurred during sign-up.');
    } finally {
      setLoading(false);
    }
  };

  const inputFields = [
    {
      id: 'first_name',
      placeholder: 'First Name',
      icon: 'assets/svg/user-outlined.svg'
    },
    {
      id: 'last_name',
      placeholder: 'Last Name',
      icon: 'assets/svg/user-outlined.svg'
    },
    {
      id: 'phone_number',
      placeholder: 'Phone Number',
      icon: 'assets/svg/call-outlined.svg'
    },
    {
      id: 'email',
      placeholder: 'Email',
      icon: 'assets/svg/mail-outlined.svg'
    }
  ];

  const handleKeyPress = async (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      if (isValid) {
        const formData = getValues();
        onSubmit(formData);
      }
    }
  };

  return {
    control,
    handleSubmit,
    onSubmit,
    errors,
    inputFields,
    loading,
    handleKeyPress,
    watch
  };
};
