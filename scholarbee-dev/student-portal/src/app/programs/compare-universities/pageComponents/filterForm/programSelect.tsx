import { Grid } from '@mui/material';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { CustomSelect } from '../customSelect';
import { FilterFormData, Program } from '../../types';

interface ProgramSelectProps {
  control: Control<FilterFormData>;
  errors: FieldErrors<FilterFormData>;
  programs: Program[];
  fetchingPrograms: boolean;
  selectedCampus: string;
  fullWidth?: boolean;
}

const ProgramSelect: React.FC<ProgramSelectProps> = ({
  control,
  errors,
  programs,
  fetchingPrograms,
  selectedCampus
}) => {
  return (
    <Grid size={{ xs: 12 }}>
      <Controller
        name="program"
        control={control}
        render={({ field }) => (
          <CustomSelect
            fullWidth
            labelText="Program"
            // placeholder="Select Program"
            options={
              selectedCampus
                ? programs.map((program) => ({
                    label: program.name,
                    value: program._id
                  }))
                : []
            }
            value={field.value}
            onChange={(value) => field.onChange(value || '')}
            loading={fetchingPrograms}
            error={errors.program?.message}
          />
        )}
      />
    </Grid>
  );
};

export default ProgramSelect;
