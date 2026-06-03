import { Grid, Typography } from '@mui/material';
import { Controller } from 'react-hook-form';
import UniversitySearchDropdown from '@/app/(pageComponents)/universitiesSearchDropdown';
import { FilterFormProps } from '@/app/programs/compare-universities/types';

const UniversitySelect: React.FC<FilterFormProps> = ({
  control,
  errors,
  dropdownKey,
  handleUniversityChange,
  showPlaceholder = false
}) => {
  return (
    <Grid size={{ xs: 12 }}>
      <Controller
        name="university"
        control={control}
        render={() => (
          <UniversitySearchDropdown
            fullWidth
            variant="outlined"
            onComparePage
            key={dropdownKey.toString()}
            title="Select University"
            name="university"
            onChange={handleUniversityChange}
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
