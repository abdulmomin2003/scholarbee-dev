'use client';
import { Box, FormControl, Typography } from '@mui/material';
import React from 'react';
import { CustomTypography } from './customTypography';
import theme from '@/utils/theme';
import TextField from '@mui/material/TextField';
import CountrySelect from './countriesSelecte';

const CustomInputField = ({
  placeholder,
  labelText,
  required,
  select,
  inputType
}: {
  placeholder?: string;
  labelText?: string;
  required?: boolean;
  select?: boolean;
  inputType?: string;
}) => {
  return (
    <Box>
      <FormControl
        fullWidth
        variant="standard"
        data-test-id="custom-input-field"
      >
        {select ? (
          <>
            <CustomTypography
              fontSize={16}
              smallFont={14}
              fontWeight={500}
              variant="h6"
            >
              {labelText || 'Title'}
              {required && (
                <Typography display="inline" color={theme.palette.error.main}>
                  *
                </Typography>
              )}
            </CustomTypography>
            <CountrySelect
              placeholder={placeholder}
              data-test-id="country-select"
            />
          </>
        ) : (
          <>
            <CustomTypography
              fontSize={16}
              smallFont={14}
              fontWeight={500}
              variant="h6"
              data-test-id="input-label"
            >
              {labelText || 'Title'}
              {required && (
                <Typography display="inline" color={theme.palette.error.main}>
                  *
                </Typography>
              )}
            </CustomTypography>
            <TextField
              variant="outlined"
              placeholder={placeholder}
              type={inputType || 'text'}
              inputProps={{ 'data-test-id': 'text-field' }}
            />
          </>
        )}
      </FormControl>
    </Box>
  );
};

export default CustomInputField;
