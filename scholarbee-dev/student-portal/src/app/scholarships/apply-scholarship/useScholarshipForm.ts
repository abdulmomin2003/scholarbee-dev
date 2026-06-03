/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScholarshipFormData, scholarshipFormSchema } from './schema';
import { useApplyForScholarshipMutation } from '@/redux/api/scholarshipApi';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { useGetUserQuery, useUpdateUserMutation } from '@/redux/api/userApi';
import {
  pakistanDistricts,
  getAllDistricts
} from '@/app/create-profile/constants/citiesAndDistricts';

export const useScholarshipForm = (scholarshipId: string) => {
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const router = useRouter();

  const [applyForScholarship, { isLoading: isApplying }] =
    useApplyForScholarshipMutation();
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();

  const { data: userData, isLoading: isLoadingUser } = useGetUserQuery();

  const hasFatherName = !!userData?.father_name;
  const hasFatherStatus = !!userData?.father_status;
  const hasDistrictDomicile = !!userData?.districtOfDomicile;
  const hasProvinceOfDomicile = !!userData?.provinceOfDomicile;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<ScholarshipFormData>({
    resolver: zodResolver(scholarshipFormSchema),
    defaultValues: {
      name: '',
      father_name: '',
      father_status: undefined,
      last_degree_type: 'Intermediate',
      last_degree_percentage: '',
      domicile: undefined,
      provinceOfDomicile: undefined,
      monthly_household_income: undefined,
      personal_statement: '',
      reference_1: '',
      reference_2: ''
    }
  });

  const selectedProvince = watch('provinceOfDomicile');

  const getDistrictOptions = () => {
    if (hasDistrictDomicile) {
      return getAllDistricts();
    }

    if (!selectedProvince) return [];
    return (
      pakistanDistricts[selectedProvince as keyof typeof pakistanDistricts] ||
      []
    );
  };

  useEffect(() => {
    if (selectedProvince && !hasDistrictDomicile) {
      setValue('domicile', undefined as unknown as string);
    }
  }, [selectedProvince, setValue, hasDistrictDomicile]);

  useEffect(() => {
    if (userData) {
      if (userData.districtOfDomicile) {
        setValue('domicile', userData.districtOfDomicile);
      }

      if (userData.provinceOfDomicile) {
        setValue('provinceOfDomicile', userData.provinceOfDomicile);
      }

      reset({
        name: `${userData.first_name ?? ''} ${userData.last_name ?? ''}`,
        father_name: userData.father_name ?? '',
        father_status: userData.father_status ?? undefined,
        last_degree_type: 'Intermediate',
        last_degree_percentage: '',
        domicile: userData.districtOfDomicile ?? undefined,
        provinceOfDomicile: userData.provinceOfDomicile ?? undefined,
        monthly_household_income: undefined,
        personal_statement: '',
        reference_1: '',
        reference_2: ''
      });
    }
  }, [userData, reset, setValue]);

  const userId = Cookies.get('userId');

  const handleSubmitScholarshipForm = async (data: ScholarshipFormData) => {
    setSubmitAttempted(true);

    if (!userId) {
      toast.error('You must be logged in to apply for scholarships');
      return;
    }

    if (!scholarshipId) {
      toast.error('No scholarship selected for application');
      return;
    }

    try {
      const userInfoUpdates: Record<string, any> = {};
      let shouldUpdateUserInfo = false;

      if (!hasFatherName && data.father_name) {
        userInfoUpdates.father_name = data.father_name;
        shouldUpdateUserInfo = true;
      }

      if (!hasFatherStatus && data.father_status) {
        userInfoUpdates.father_status = data.father_status;
        shouldUpdateUserInfo = true;
      }

      if (!hasDistrictDomicile && data.domicile) {
        userInfoUpdates.districtOfDomicile = data.domicile;
        shouldUpdateUserInfo = true;
      }

      if (!hasProvinceOfDomicile && data.provinceOfDomicile) {
        userInfoUpdates.provinceOfDomicile = data.provinceOfDomicile;
        shouldUpdateUserInfo = true;
      }

      if (shouldUpdateUserInfo) {
        try {
          await updateUser({
            user_id: userData?._id ?? '',
            data: userInfoUpdates
          }).unwrap();
        } catch (error: unknown) {
          toast.error(
            (error as { data?: { message?: string } })?.data?.message ??
              'Failed to update your profile information'
          );
          return;
        }
      }

      // Prepare the scholarship application data
      const formattedData = {
        student_id: userId,
        reference_1: data.reference_1,
        reference_2: data.reference_2,
        scholarship_id: scholarshipId,
        personal_statement: data.personal_statement,
        student_snapshot: {
          monthly_household_income: data.monthly_household_income,
          last_degree: {
            percentage: data.last_degree_percentage,
            level: data.last_degree_type
          }
        }
      };

      await applyForScholarship(formattedData).unwrap();
      toast.success('Scholarship application submitted successfully!');
      router.replace(`/profile?tab=scholarships`);
    } catch (error: unknown) {
      if ((error as { status?: number })?.status === 409) {
        toast.error((error as { data?: { message?: string } })?.data?.message);
        router.replace(`/profile?tab=scholarships`);
        return;
      }
      console.error('Error submitting application:', error);
      toast.error(
        (error as { data?: { message?: string } })?.data?.message ??
          'Failed to submit scholarship application. Please try again.'
      );
    }
  };

  const onSubmit = handleSubmit(handleSubmitScholarshipForm);

  return {
    control,
    errors,
    isLoading: isApplying || isUpdatingUser || isLoadingUser,
    submitAttempted,
    onSubmit,
    hasFatherName,
    hasFatherStatus,
    hasDistrictDomicile,
    hasProvinceOfDomicile,
    getDistrictOptions,
    selectedProvince
  };
};
