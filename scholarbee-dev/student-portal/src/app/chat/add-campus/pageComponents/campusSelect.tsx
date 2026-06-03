/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Grid,
  Autocomplete,
  TextField,
  Typography,
  Box,
  LinearProgress
} from '@mui/material';
import { Controller } from 'react-hook-form';

const CampusSelect = ({
  control,
  errors,
  fetchingCampuses,
  fullWidth,
  showPlaceholder,
  campusSearchInput,
  handelCampusValueChange,
  allCampuses
}: any) => {
  return (
    <Grid size={{ xs: 12 }}>
      <Controller
        name="campus"
        control={control}
        render={({ field }) => (
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
              data-test-id="select-label-Campus"
            >
              Campus
            </Typography>
            <Autocomplete
              options={allCampuses || []}
              getOptionLabel={(option: any) => option.name || ''}
              loading={fetchingCampuses}
              value={
                field.value
                  ? allCampuses.find((c: any) => c?._id === field.value) || null
                  : null
              }
              onChange={(_, newValue) => {
                field.onChange(newValue ? newValue._id || newValue.id : '');
              }}
              inputValue={campusSearchInput}
              onInputChange={(_, newInputValue) => {
                handelCampusValueChange(newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={showPlaceholder ? 'Select campus' : ''}
                  variant="outlined"
                  error={!!errors?.campus}
                  helperText={errors?.campus?.message}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {fetchingCampuses ? (
                          <LinearProgress sx={{ width: '20px' }} />
                        ) : null}
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
        )}
      />
    </Grid>
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

export default CampusSelect;
