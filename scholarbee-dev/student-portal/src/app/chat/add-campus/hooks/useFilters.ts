/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGetCampusesQuery } from '@/redux/api/compareFiltersApi';
import { useState } from 'react';

const filterSchema = z.object({
  university: z
    .object({
      id: z.string(),
      name: z.string()
    })
    .nullable()
    .refine((value) => value !== null, 'Please select a university'),
  campus: z.string().min(1, 'Please select a campus')
});

export const useAddCampus = () => {
  const [campusSearchInput, setCampusSearchInput] = useState('');

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    setError,
    formState: { errors }
  } = useForm<any>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      university: null,
      campus: ''
    }
  });

  const handelCampusValueChange = (value: any) => {
    setCampusSearchInput(value);
  };

  const selectedUniversity = watch('university');

  const { data: campuses = [], isFetching: fetchingCampuses } =
    useGetCampusesQuery(selectedUniversity?.id || '', {
      skip: !selectedUniversity?.id,
      refetchOnMountOrArgChange: true
    });

  const filteredCampuses = selectedUniversity?.id
    ? campusSearchInput
      ? campuses.filter((campus: any) =>
          campus.name.toLowerCase().includes(campusSearchInput.toLowerCase())
        )
      : campuses
    : [];

  return {
    form: {
      control,
      handleSubmit,
      watch,
      setValue,
      reset,
      setError,
      errors
    },
    campuses: filteredCampuses,
    allCampuses: campuses,
    fetchingCampuses,
    campusSearchInput,
    handelCampusValueChange
  };
};
