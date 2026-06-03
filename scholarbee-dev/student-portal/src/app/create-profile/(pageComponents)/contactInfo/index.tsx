'use client';
import { Box, CircularProgress, Grid, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import CustomInput from '../customInput';
import { User } from '../../constants/types';
import ButtonsComponent from '../buttonsComponent';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { contactInfoSchema } from '../../schemas';
import { pakistanDistricts } from '../../constants/citiesAndDistricts';
import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useContactInfo } from './useContactInfo';

// Import MarksGPA type
interface MarksGPA {
  total_marks_gpa: string;
  obtained_marks_gpa: string;
}

interface ContactInfoProps {
  onNext: () => void;
  onPrev: () => void;
}

const ContactInfo = ({ onNext, onPrev }: ContactInfoProps) => {
  const {
    userData,
    isLoadingUser,
    isUpdatingUser,
    isRegistering,
    registerEvent,
    updateUser
  } = useContactInfo();

  const {
    control,
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm<User>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      email: '',
      phone_number: '',
      fatherEmailAddress: '',
      fatherPhoneNumber: '',
      provinceOfDomicile: undefined,
      districtOfDomicile: '',
      stateOrProvince: '',
      city: '',
      postalCode: '',
      streetAddress: ''
    }
  });

  const provinceOfDomicile = watch('provinceOfDomicile');
  const stateOrProvince = watch('stateOrProvince');

  const admissionState = useSelector((state: RootState) => state.admission);
  const { campusId, programId, admissionProgramId, universityId } =
    admissionState;

  useEffect(() => {
    if (userData) {
      reset(userData);
    }
  }, [userData, reset]);

  // We don't need these useEffects anymore as we'll handle clearing with onChangeWithDependency

  const onSubmit = async (contact_data: User) => {
    try {
      const response = await registerEvent({
        step: 'profile/self',
        universityId: universityId,
        admissionProgramId: admissionProgramId,
        programId: programId,
        eventType: 'navigate',
        campusId: campusId
      });
      if (!isDirty && userData?.current_stage > 1) {
        onNext();
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { email, ...dataToUpdate } = contact_data;

      const user = await updateUser({
        // user_id: userData?.user.id || '',
        user_id: userData?._id || '',
        data: {
          ...dataToUpdate,
          ...(userData?.current_stage === 1 && { current_stage: 2 })
        }
      }).unwrap();
      // Set user cookie with proper configuration
      const cookieOptions = {
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/'
      };
      Cookies.set('user', JSON.stringify(user), cookieOptions);
      if (response?.data?.success) {
        onNext();
      }
      toast.success('Information updated successfully');
      onNext();
    } catch (error) {
      console.log('error while update', error);
      toast.error('Failed to update data');
    }
  };

  const getDistrictOptions = () => {
    if (!provinceOfDomicile) return [];

    const provinceMap: Record<string, string> = {
      khyber_pakhtunkhwa: 'khyber_pakhtunkhwa',
      punjab: 'punjab',
      sindh: 'sindh',
      balochistan: 'balochistan',
      gilgit: 'gilgit',
      kashmir: 'kashmir',
      islamabad: 'islamabad'
    };

    const mappedProvince =
      provinceMap[provinceOfDomicile] || provinceOfDomicile;

    return (
      pakistanDistricts[mappedProvince as keyof typeof pakistanDistricts] || []
    );
  };

  const getCityOptions = () => {
    if (!stateOrProvince) return [];

    // Map the form values to the keys in pakistanDistricts
    const provinceMap: Record<string, string> = {
      khyber_pakhtunkhwa: 'khyber_pakhtunkhwa',
      punjab: 'punjab',
      sindh: 'sindh',
      balochistan: 'balochistan',
      gilgit: 'gilgit',
      kashmir: 'kashmir',
      islamabad: 'islamabad'
    };

    const mappedProvince = provinceMap[stateOrProvince] || stateOrProvince;

    return (
      pakistanDistricts[mappedProvince as keyof typeof pakistanDistricts] || []
    );
  };

  // Update the CONTACT_INFO_FIELDS type to include onChangeHandler
  type ContactInfoField = {
    name: string;
    label: string;
    type: string;
    options?: { value: string; label: string }[];
    required?: boolean;
    placeholder?: string;
    notEditable?: boolean;
    displayEmpty?: boolean;
    onChangeHandler?: (value: string | MarksGPA) => void;
  };

  const CONTACT_INFO_FIELDS: ContactInfoField[] = [
    {
      name: 'email',
      label: 'Email Address',
      type: 'text',
      required: true,
      notEditable: true,
      placeholder: 'Enter your email address'
    },
    {
      name: 'phone_number',
      label: 'Phone Number',
      type: 'tel',
      required: true,
      placeholder: 'Enter your phone number'
    },
    {
      name: 'fatherEmailAddress',
      label: "Father's Email Address",
      type: 'text',
      placeholder: "Enter your father's email address"
    },
    {
      name: 'fatherPhoneNumber',
      label: "Father's Phone Number",
      type: 'tel',
      placeholder: "Enter your father's phone number"
    },
    {
      name: 'provinceOfDomicile',
      label: 'Province of Domicile',
      type: 'select',
      options: [
        { value: 'khyber_pakhtunkhwa', label: 'Khyber Pakhtunkhwa' },
        { value: 'punjab', label: 'Punjab' },
        { value: 'sindh', label: 'Sindh' },
        { value: 'balochistan', label: 'Balochistan' },
        { value: 'gilgit', label: 'Gilgit-Baltistan' },
        { value: 'kashmir', label: 'Azad Kashmir' },
        { value: 'islamabad', label: 'Islamabad Capital Territory' }
      ],
      required: true,
      placeholder: 'Select your province of domicile',
      onChangeHandler: (value: string | MarksGPA) => {
        // Clear district when province changes
        if (typeof value === 'string' && value) {
          setValue('districtOfDomicile', '', {
            shouldValidate: false,
            shouldDirty: true
          });
        }
      }
    },
    {
      name: 'districtOfDomicile',
      label: 'District of Domicile',
      type: 'select',
      options: getDistrictOptions(),
      required: true,
      placeholder: 'Select your district of domicile'
    },
    {
      name: 'stateOrProvince',
      label: 'State/Province',
      type: 'select',
      options: [
        { value: 'khyber_pakhtunkhwa', label: 'Khyber Pakhtunkhwa' },
        { value: 'punjab', label: 'Punjab' },
        { value: 'sindh', label: 'Sindh' },
        { value: 'balochistan', label: 'Balochistan' },
        { value: 'gilgit', label: 'Gilgit-Baltistan' },
        { value: 'kashmir', label: 'Azad Kashmir' },
        { value: 'islamabad', label: 'Islamabad Capital Territory' }
      ],
      required: true,
      placeholder: 'Select your state/province',
      onChangeHandler: (value: string | MarksGPA) => {
        // Clear city when state/province changes
        if (typeof value === 'string' && value) {
          setValue('city', '', {
            shouldValidate: false,
            shouldDirty: true
          });
        }
      }
    },
    {
      name: 'city',
      label: 'City',
      type: 'select',
      options: getCityOptions(),
      required: true,
      placeholder: 'Select your city'
    },
    {
      name: 'postalCode',
      label: 'Postal/Zip Code',
      type: 'text',
      required: true,
      placeholder: 'Enter your postal/zip code'
    },
    {
      name: 'streetAddress',
      label: 'Street Address',
      type: 'text',
      required: true,
      placeholder: 'Enter your street address'
    }
  ];

  return (
    <Box>
      <Typography fontSize="500" variant="h5" mb={2}>
        Contact Information
      </Typography>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        {isLoadingUser ? (
          <Box display={'flex'} justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {CONTACT_INFO_FIELDS.map((field, index) => (
              <Grid size={{ xs: 12, sm: 6 }} key={index}>
                <Controller
                  name={field.name as keyof User}
                  control={control}
                  render={({ field: inputField }) => (
                    <CustomInput
                      label={field.label}
                      type={field.type}
                      value={inputField?.value?.toString() || ''}
                      name={inputField.name}
                      onChange={inputField.onChange}
                      options={field.options || []}
                      required={field.required}
                      error={!!errors[field.name as keyof User]}
                      helperText={errors[field.name as keyof User]?.message}
                      notEditable={field?.notEditable || false}
                      displayEmpty={field.type === 'select'}
                      placeholder={field.placeholder}
                      onChangeWithDependency={field.onChangeHandler}
                    />
                  )}
                />
              </Grid>
            ))}
          </Grid>
        )}
        <ButtonsComponent
          loading={isUpdatingUser || isRegistering}
          goToPrevStep={onPrev}
        />
      </Box>
    </Box>
  );
};

export default ContactInfo;
