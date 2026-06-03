import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useGetCampusesQuery,
  useGetProgramsQuery
} from '@/redux/api/compareFiltersApi';
import { FilterFormData } from '../types';

const filterSchema = z.object({
  university: z
    .object({
      id: z.string(),
      name: z.string()
    })
    .nullable()
    .refine((value) => value !== null, 'Please select a university'),
  campus: z.string().min(1, 'Please select a campus'),
  program: z.string().min(1, 'Please select a program')
});

// Hook to create a single form instance for a position
const usePositionForm = () => {
  const form = useForm<FilterFormData>({
    resolver: zodResolver(filterSchema),
    mode: 'onChange', // Validate on change to provide immediate feedback
    defaultValues: {
      university: null,
      campus: '',
      program: ''
    }
  });

  const selectedUniversity = form.watch('university');
  const selectedCampus = form.watch('campus');

  // Fetch campuses based on selected university
  const { data: campuses = [], isFetching: fetchingCampuses } =
    useGetCampusesQuery(selectedUniversity?.id || '', {
      skip: !selectedUniversity?.id,
      refetchOnMountOrArgChange: true
    });

  // Fetch programs based on selected campus
  const { data: programs = [], isFetching: fetchingPrograms } =
    useGetProgramsQuery(selectedCampus, {
      skip: !selectedCampus,
      refetchOnMountOrArgChange: true // Always refetch when campus changes
    });

  return {
    form,
    programs: selectedUniversity?.id ? programs : [],
    campuses: selectedUniversity?.id ? campuses : [],
    fetchingPrograms,
    fetchingCampuses,
    selectedUniversity,
    selectedCampus
  };
};

export const useComparisonFilters = () => {
  // Create two separate form instances, one for each position
  const position0 = usePositionForm();
  const position1 = usePositionForm();

  return {
    position0,
    position1
  };
};
