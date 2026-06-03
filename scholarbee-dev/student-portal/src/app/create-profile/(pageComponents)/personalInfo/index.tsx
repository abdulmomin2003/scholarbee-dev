import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, CircularProgress, Grid, Typography } from '@mui/material';
import CustomInput from '../customInput';
import ImagePicker from '@/components/molecules/imagePicker';
import ButtonsComponent from '../buttonsComponent';
import { PERSONAL_INFO_FIELDS } from '../../constants';
import { User } from '../../constants/types';
import { personalInfoSchema } from '../../schemas';
import { usePersonalInfo } from './usePersonalInfo';

const PersonalInfo = ({ onNext }: { onNext: () => void }) => {
  const {
    control,
    reset,
    watch,
    handleSubmit,
    formState: { errors, isDirty, dirtyFields },
    setValue
  } = useForm<User>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      date_of_birth: '',
      gender: undefined,
      nationality: '',
      father_name: '',
      father_status: undefined,
      father_profession: '',
      father_income: '',
      mother_name: '',
      mother_status: undefined,
      mother_profession: '',
      mother_income: '',
      religion: '',
      special_person: undefined,
      profile_image_url: ''
    }
  });

  const userFormData = watch(); // watch all fields

  const {
    userData,
    isLoadingUser,
    isRegistering,
    isUpdatingUser,
    handleSubmitData,
    handleImageUpload,
    handleImageUploadComplete
  } = usePersonalInfo({
    isDirty,
    onNext,
    userFormData,
    setValue,
    dirtyFields
  });

  useEffect(() => {
    if (!userData) return;

    // Do not reset while the user has unsaved edits. A profile photo upload calls
    // `updateUser`, which refetches `userData` and would otherwise re-run this
    // effect and wipe dropdown selections that were not yet saved.
    if (isDirty) return;

    // Transform null values to empty strings to avoid "Expected string, received null" errors
    const cleanedUserData = Object.fromEntries(
      Object.entries(userData).map(([key, value]) => [
        key,
        value === null ? '' : value
      ])
    );
    reset(cleanedUserData);
  }, [userData, reset, isDirty]);

  return (
    <Box>
      <Typography fontSize="500" variant="h6">
        Personal Information
      </Typography>
      <ImagePicker
        imageUrl={watch('profile_image_url') || ''}
        onImageUpload={handleImageUpload}
        onImageUploadComplete={handleImageUploadComplete}
        errorMessage={errors?.profile_image_url?.message}
      />
      <Box component="form" onSubmit={handleSubmit(handleSubmitData)}>
        {isLoadingUser ? (
          <Box display={'flex'} justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {PERSONAL_INFO_FIELDS.map((field, index) => (
              <Grid size={{ xs: 12, sm: 6 }} key={index}>
                <Controller
                  name={field.name as keyof User}
                  control={control}
                  render={({ field: inputField }) => (
                    <CustomInput
                      label={field.label}
                      type={field.type}
                      value={inputField.value?.toString() || ''}
                      name={inputField.name}
                      onChange={inputField.onChange}
                      options={field?.options || []}
                      required={field.required}
                      error={!!errors[field.name as keyof User]}
                      helperText={errors[field.name as keyof User]?.message}
                      placeholder={field?.placeholder}
                    />
                  )}
                />
              </Grid>
            ))}
          </Grid>
        )}
        <ButtonsComponent
          noBackButton
          buttonTxt={!isDirty ? 'Next' : 'Save & Next'}
          loading={isUpdatingUser || isRegistering}
        />
      </Box>
    </Box>
  );
};

export default PersonalInfo;
