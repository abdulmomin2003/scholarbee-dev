import { COLORS } from '@/constants/colors';
import { Autocomplete, TextField, Typography } from '@mui/material';
import React from 'react';

const PlaceholderField = ({
  label,
  variant = 'outlined',
  labelText
}: {
  label?: string;
  variant?: 'filled' | 'outlined';
  labelText?: string;
}) => {
  return (
    <>
      {labelText && (
        <Typography
          sx={styles.label}
          fontWeight="medium"
          variant="body1"
          data-test-id={`select-label-${labelText}`}
        >
          {labelText}
        </Typography>
      )}

      <Autocomplete
        disablePortal
        disabled
        options={[{ title: 'Movie' }, { title: 'TV Show' }]}
        sx={{
          width: 'full',
          cursor: 'pointer'
        }}
        renderInput={(params) => (
          <TextField
            sx={{
              borderRadius: '8px',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  border: `1px solid ${COLORS.borderColor}`
                }
              }
            }}
            variant={variant}
            {...params}
            label={label}
          />
        )}
      />
    </>
  );
};

export default PlaceholderField;

const styles = {
  label: {
    color: COLORS.borderColor,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    mb: 1
  }
};
