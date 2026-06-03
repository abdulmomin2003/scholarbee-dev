import { useEffect, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  useGetUserQuery,
  useAddNationalIDCardMutation,
  useUpdateNationalIDCardMutation,
  useUpdateUserMutation
} from '@/redux/api/userApi';
import { useSelector } from 'react-redux';
import { NationalIDCard as INationalIDCard } from '../../constants/types';
import { useRegisterEventMutation } from '@/redux/api/analyticsApi';
import { RootState } from '@/redux/store';

export const useNationalIdCard = (form: UseFormReturn<INationalIDCard>) => {
  const {
    reset,
    formState: { isDirty }
  } = form;

  const [registerEvent, { isLoading: isRegistering }] =
    useRegisterEventMutation();
  const { data: userData, isLoading: isLoadingUser } = useGetUserQuery();
  const [addNationalIDCard, { isLoading: isAddingIDCard }] =
    useAddNationalIDCardMutation();
  const [updateNationalIDCard, { isLoading: isUpdatingIDCard }] =
    useUpdateNationalIDCardMutation();
  const [updateUser, { isLoading: isUpdatingUserInfo }] =
    useUpdateUserMutation();

  const isUpdatingUser =
    isAddingIDCard || isUpdatingIDCard || isUpdatingUserInfo;

  const admissionState = useSelector((state: RootState) => state.admission);
  const { campusId, programId, admissionProgramId, universityId } =
    admissionState;

  useEffect(() => {
    // Check if national_id_card exists directly in userData or nested in userData.user
    const nationalIDCard =
      userData?.national_id_card || userData?.user?.national_id_card;

    if (nationalIDCard) {
      reset(nationalIDCard);
    }
  }, [userData, reset]);

  const onSubmit = useCallback(
    async (id_data: INationalIDCard, onNext: () => void) => {
      const userId = userData?._id || '';
      if (!userId) {
        toast.error('User ID not found');
        return;
      }

      const hasNationalIDCard = !!(
        userData?.national_id_card || userData?.user?.national_id_card
      );

      await registerEvent({
        step: 'profile/docs',
        universityId,
        admissionProgramId,
        programId,
        eventType: 'navigate',
        campusId
      });

      // If form is not dirty and user already has ID card and is past stage 3, just proceed
      if (!isDirty && hasNationalIDCard && userData?.current_stage > 3) {
        onNext();
        return;
      }

      // If form is not dirty and user is on stage 3 but doesn't have ID card, update stage and proceed
      if (!isDirty && !hasNationalIDCard && userData?.current_stage === 3) {
        try {
          await updateUser({
            user_id: userId,
            data: { current_stage: 4 }
          }).unwrap();
          onNext();
          return;
        } catch (error) {
          console.error('Error updating stage:', error);
          // Still proceed even if stage update fails
          onNext();
          return;
        }
      }

      try {
        const national_id_card_data = {
          front_side: id_data.front_side || '',
          back_side: id_data.back_side || ''
        };

        // Only update/add if at least one field has a value and form is dirty
        const hasData = !!(
          national_id_card_data.front_side || national_id_card_data.back_side
        );

        if (isDirty && hasData) {
          if (hasNationalIDCard) {
            await updateNationalIDCard({
              user_id: userId,
              data: national_id_card_data
            }).unwrap();
            toast.success('ID Card updated successfully');
          } else {
            await addNationalIDCard({
              user_id: userId,
              data: {
                isProfileCompleted: true,
                national_id_card: national_id_card_data
              }
            }).unwrap();
            toast.success('ID Card added successfully');
          }
        }

        // Always update stage to 4 if currently on stage 3, regardless of whether data was uploaded
        if (userData?.current_stage === 3) {
          await updateUser({
            user_id: userId,
            data: { current_stage: 4 }
          }).unwrap();
        }

        onNext();
      } catch (error) {
        console.error('Error managing National ID Card:', error);
        toast.error(
          `Failed to ${hasNationalIDCard ? 'update' : 'add'} ID Card`
        );
        // Still proceed to next step even if there's an error
        onNext();
      }
    },
    [
      userData?._id,
      userData?.national_id_card,
      userData?.user?.national_id_card,
      userData?.current_stage,
      registerEvent,
      universityId,
      admissionProgramId,
      programId,
      campusId,
      updateUser,
      isDirty,
      updateNationalIDCard,
      addNationalIDCard
    ]
  );

  return {
    userData,
    isLoadingUser,
    isRegistering,
    isUpdatingUser,
    onSubmit
  };
};

export default useNationalIdCard;
