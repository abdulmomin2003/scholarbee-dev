// shared/CustomSelect.tsx
import React from 'react';
import {
  Autocomplete,
  Box,
  TextField,
  Typography,
  LinearProgress
} from '@mui/material';
import { SelectOption } from '../types';

interface CustomSelectProps {
  labelText: string;
  variant?: 'filled' | 'outlined';
  placeholder?: string;
  options: SelectOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  loading?: boolean;
  error?: string;
  onProgramPage?: boolean;
  fullWidth?: boolean;
  showPlaceholder?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  labelText,
  placeholder,
  variant = 'outlined',
  options,
  value,
  onChange,
  loading = false,
  error,
  fullWidth,
  showPlaceholder
}) => {
  return (
    <Box
      sx={{
        ...styles.container,
        width: '100%',
        maxWidth: fullWidth ? '100%' : '350px'
      }}
    >
      <Typography
        sx={styles.label}
        fontWeight="medium"
        variant="body1"
        data-test-id={`select-label-${labelText}`}
      >
        {labelText}
      </Typography>
      <Autocomplete
        options={options}
        getOptionLabel={(option) => option.label}
        loading={loading}
        value={
          value && value.trim()
            ? options?.find((opt) => opt.value === value) || null
            : null
        }
        onChange={(_, newValue) => onChange(newValue?.value || '')}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={showPlaceholder ? 'Select campus' : placeholder}
            variant={variant}
            error={!!error}
            helperText={error}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {loading ? <LinearProgress sx={{ width: '20px' }} /> : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              )
            }}
            sx={{
              ...styles.noBorder,
              ...(showPlaceholder && { backgroundColor: 'white' })
            }}
          />
        )}
        sx={styles.autocomplete}
      />
    </Box>
  );
};

const styles = {
  container: {
    margin: 'auto'
  },
  label: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    mb: 1
  },
  autocomplete: {
    borderRadius: '12px'
  },
  noBorder: {
    '& .MuiFilledInput-root': {
      backgroundColor: '#F7F8F9',
      borderRadius: '8px',
      '&:before': {
        borderBottom: 'none'
      },
      '&:hover:before': {
        borderBottom: 'none !important'
      },
      '&:after': {
        borderBottom: 'none'
      }
    }
  }
};

export { CustomSelect };
