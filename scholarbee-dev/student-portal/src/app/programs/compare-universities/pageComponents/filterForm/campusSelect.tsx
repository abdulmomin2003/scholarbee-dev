import { Grid } from '@mui/material';
import {
  Controller,
  Control,
  FieldErrors,
  UseFormWatch
} from 'react-hook-form';
import { CustomSelect } from '../customSelect';
import { FilterFormData, Campus, University } from '../../types';

interface CampusSelectProps {
  control: Control<FilterFormData>;
  errors: FieldErrors<FilterFormData>;
  campuses: Campus[];
  fetchingCampuses: boolean;
  watch: UseFormWatch<FilterFormData>;
  selectedUniversity: University | null;
  fullWidth?: boolean;
  showPlaceholder?: boolean;
}

const CampusSelect: React.FC<CampusSelectProps> = ({
  control,
  errors,
  campuses,
  fetchingCampuses,
  watch,
  selectedUniversity,
  fullWidth,
  showPlaceholder
}) => {
  return (
    <Grid size={{ xs: 12 }}>
      <Controller
        name="campus"
        control={control}
        render={({ field }) => (
          <CustomSelect
            fullWidth={fullWidth}
            showPlaceholder={showPlaceholder}
            labelText="Campus"
            options={
              selectedUniversity
                ? campuses.map((campus) => ({
                    label: campus.name,
                    value: campus._id
                  }))
                : []
            }
            value={field.value}
            onChange={(value) => {
              field.onChange(value || '');
              watch('program', '');
            }}
            loading={fetchingCampuses}
            error={errors?.campus?.message}
          />
        )}
      />
    </Grid>
  );
};

export default CampusSelect;
