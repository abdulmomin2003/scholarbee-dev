import { useGetUserQuery } from '@/redux/api/userApi';

export const useCreateProfile = () => {
  const {
    data: userData,
    isLoading: isLoadingUser,
    isFetching: isFetchingUser
  } = useGetUserQuery();

  return {
    userData,
    isLoadingUser,
    isFetchingUser
  };
};
