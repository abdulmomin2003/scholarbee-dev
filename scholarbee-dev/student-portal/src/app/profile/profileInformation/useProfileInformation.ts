/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGetUserQuery, useUpdateUserMutation } from '@/redux/api/userApi';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '@/app/create-profile/constants/types';
import { profileSchema } from './schema';
import { pakistanDistricts } from '@/app/create-profile/constants/citiesAndDistricts';
import { toast } from 'react-toastify';

export const useProfileInformation = () => {
  const { data: user, isLoading: isLoadingUser } = useGetUserQuery();
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const [isEditing, setIsEditing] = useState(false);

  const {
    control,
    reset,
    watch,
    handleSubmit,
    formState: { errors, isDirty, dirtyFields },
    setValue
  } = useForm<User>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      date_of_birth: '',
      gender: undefined,
      nationality: '',
      father_name: '',
      email: '',
      phone_number: '',
      stateOrProvince: '',
      city: '',
      postalCode: '',
      streetAddress: '',
      provinceOfDomicile: undefined,
      districtOfDomicile: '',
      profile_image_url: ''
    }
  });

  const clearProfileImage = () => {
    setValue('profile_image_url', '', {
      shouldDirty: true
    });
  };

  const provinceOfDomicile = watch('provinceOfDomicile');
  const stateOrProvince = watch('stateOrProvince');

  useEffect(() => {
    if (provinceOfDomicile && dirtyFields.provinceOfDomicile) {
      setValue('districtOfDomicile', '', {
        shouldValidate: false,
        shouldDirty: true
      });
    }
  }, [dirtyFields.provinceOfDomicile, provinceOfDomicile, setValue]);

  // Clear city when state/province changes
  useEffect(() => {
    if (stateOrProvince && dirtyFields.stateOrProvince) {
      setValue('city', '', {
        shouldValidate: false,
        shouldDirty: true
      });
    }
  }, [dirtyFields.stateOrProvince, stateOrProvince, setValue]);

  useEffect(() => {
    if (user) {
      reset(user);
    }
  }, [user, reset]);

  const handleEditClick = () => setIsEditing(true);
  const handleCancelEdit = () => {
    setIsEditing(false);
    reset(user);
  };

  const handleSaveProfile = async (data: User) => {
    try {
      if (user?._id && isDirty) {
        // Only include fields that have been changed
        const changedFields: Partial<User> = {};

        // Iterate through dirtyFields to get only the changed fields
        Object.keys(dirtyFields).forEach((fieldName) => {
          const key = fieldName as keyof User;
          // Skip profile_image_url - don't send it in API calls
          if (key === 'profile_image_url') {
            return;
          }
          const value = data[key];
          if (value !== undefined && value !== '') {
            (changedFields as any)[key] = value;
          }
        });

        await updateUser({
          user_id: user._id,
          data: changedFields
        }).unwrap();
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else if (!isDirty) {
        setIsEditing(false);
      }
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'data' in error
          ? (error.data as { message?: string })?.message
          : 'Failed to update profile';
      toast.error(errorMessage);
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    setValue('profile_image_url', imageUrl, { shouldDirty: true });
  };

  const handleImageUploadComplete = async (imageUrl: string) => {
    try {
      if (user?._id) {
        await updateUser({
          user_id: user._id,
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
  };

  const getDistrictOptions = () => {
    if (!provinceOfDomicile) return [];

    return (
      pakistanDistricts[provinceOfDomicile as keyof typeof pakistanDistricts] ||
      []
    );
  };

  const getCityOptions = () => {
    if (!stateOrProvince) return [];
    return (
      pakistanDistricts[stateOrProvince as keyof typeof pakistanDistricts] || []
    );
  };

  return {
    user,
    isLoadingUser,
    isUpdatingUser,
    isEditing,
    control,
    watch,
    handleSubmit,
    handleEditClick,
    handleCancelEdit,
    handleSaveProfile,
    handleImageUpload,
    handleImageUploadComplete,
    errors,
    setValue,
    getDistrictOptions,
    getCityOptions,
    isDirty,
    clearProfileImage
  };
};
