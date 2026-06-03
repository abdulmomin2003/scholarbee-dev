import { useRegisterEventMutation } from '@/redux/api/analyticsApi';
import { useGetUserQuery, useUpdateUserMutation } from '@/redux/api/userApi';

export const useContactInfo = () => {
  const { data: userData, isLoading: isLoadingUser } = useGetUserQuery();
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();

  const [registerEvent, { isLoading: isRegistering }] =
    useRegisterEventMutation();

  return {
    userData,
    isLoadingUser,
    isUpdatingUser,
    isRegistering,
    registerEvent,
    updateUser
  };
};
