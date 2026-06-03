import { Grid, Typography } from '@mui/material';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { useRef, useCallback } from 'react';
import UniversitySearchDropdown from '@/app/(pageComponents)/universitiesSearchDropdown';
import { FilterFormData } from '../../types';

interface UniversitySelectProps {
  control: Control<FilterFormData>;
  errors: FieldErrors<FilterFormData>;
  dropdownKey: boolean;
  handleUniversityChange: (name: string, id: string) => void;
  showPlaceholder?: boolean;
}

const UniversitySelect: React.FC<UniversitySelectProps> = ({
  control,
  errors,
  dropdownKey,
  handleUniversityChange,
  showPlaceholder = false
}) => {
  // Store the university name and id to combine them when both are available
  const universityDataRef = useRef<{ name: string; id: string }>({
    name: '',
    id: ''
  });

  const handleChange = useCallback(
    (name: string, value: string) => {
      if (name === 'university') {
        // First call: name is 'university', value is the university name
        universityDataRef.current.name = value;
      } else if (name === 'universityId') {
        // Second call: name is 'universityId', value is the university id
        universityDataRef.current.id = value;
        // Now we have both, call the parent handler
        handleUniversityChange(
          universityDataRef.current.name,
          universityDataRef.current.id
        );
      } else {
        // Fallback: if the format is different, try to use it directly
        handleUniversityChange(name, value);
      }
    },
    [handleUniversityChange]
  );

  return (
    <Grid size={{ xs: 12 }}>
      <Controller
        name="university"
        control={control}
        render={({ field }) => (
          <UniversitySearchDropdown
            fullWidth
            variant="outlined"
            onComparePage
            key={dropdownKey.toString()}
            title="Select University"
            name="university"
            onChange={handleChange}
            defaultValue={field?.value ?? undefined}
            showPlaceholder={showPlaceholder}
          />
        )}
      />
      {errors?.university && (
        <Typography color="error" fontSize="0.75rem" mt={0.5}>
          {errors.university.message}
        </Typography>
      )}
    </Grid>
  );
};

export default UniversitySelect;
