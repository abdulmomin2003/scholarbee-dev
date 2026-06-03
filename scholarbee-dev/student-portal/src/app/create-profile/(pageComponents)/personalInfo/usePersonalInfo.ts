import { useRegisterEventMutation } from '@/redux/api/analyticsApi';
import { useGetUserQuery, useUpdateUserMutation } from '@/redux/api/userApi';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { User } from '../../constants/types';
import { sanitizeUser } from '../../utils/sanitizeUser';

export const usePersonalInfo = ({
  isDirty,
  onNext,
  userFormData,
  setValue,
  dirtyFields
}: {
  isDirty: boolean;
  onNext: () => void;
  userFormData: User;
  setValue: (
    field: keyof User,
    value: string | undefined,
    options?: { shouldDirty: boolean }
  ) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dirtyFields?: Record<string, any>;
}) => {
  const { data: userData, isLoading: isLoadingUser } = useGetUserQuery();
  const [registerEvent, { isLoading: isRegistering }] =
    useRegisterEventMutation();
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();

  const admissionState = useSelector((state: RootState) => state.admission);
  const { campusId, programId, admissionProgramId, universityId } =
    admissionState;

  const handleSubmitData = useCallback(async () => {
    try {
      await registerEvent({
        step: 'profile/self',
        universityId,
        admissionProgramId,
        programId,
        eventType: 'navigate',
        campusId
      });

      if (!isDirty && userData?.current_stage > 0) {
        onNext();
        return;
      }

      const sanitizedUserData = sanitizeUser(userFormData, dirtyFields);

      const dataToUpdate = {
        ...sanitizedUserData,
        ...(userData?.current_stage === 0 && { current_stage: 1 })
      };

      await updateUser({
        user_id: userData?._id || '',
        data: dataToUpdate
      }).unwrap();

      toast.success('Data added successfully');

      onNext();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update data';
      console.error('Error updating data:', error);
      toast.error(errorMessage);
    }
  }, [
    registerEvent,
    updateUser,
    userFormData,
    userData,
    isDirty,
    onNext,
    campusId,
    programId,
    admissionProgramId,
    universityId,
    dirtyFields
  ]);

  const handleImageUpload = (imageUrl: string) => {
    setValue('profile_image_url', imageUrl, { shouldDirty: true });
  };

  const handleImageUploadComplete = useCallback(
    async (imageUrl: string) => {
      try {
        if (userData?._id) {
          await updateUser({
            user_id: userData._id,
            data: { profile_image_url: imageUrl }
          }).unwrap();
          toast.success('Profile photo uploaded successfully');
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to upload profile photo';
        console.error('Error uploading profile photo:', error);
        toast.error(errorMessage);
      }
    },
    [updateUser, userData]
  );

  return {
    userData,
    isLoadingUser,
    isRegistering,
    isUpdatingUser,
    handleSubmitData,
    handleImageUpload,
    handleImageUploadComplete
  };
};
