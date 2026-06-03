'use client';
import { Autocomplete, Box, LinearProgress, TextField } from '@mui/material';
import React from 'react';

interface DropdownProps {
  item: {
    id: number;
    title: string;
    name: string;
  };
  onChange: (name: string, value: string) => void;
  isLoading: boolean;
  options: { label: string; value: string }[];
  value?: string;
}

const SearchDropdown = ({
  item,
  onChange,
  isLoading,
  options,
  value = ''
}: DropdownProps) => {
  const handleSelectChange = (
    event: React.SyntheticEvent,
    value: { label: string; value: string } | null
  ) => {
    if (value) {
      onChange(item.name, value.value);
    } else {
      onChange(item.name, '');
    }
  };

  const selectedOption =
    options?.find((option) => option.value === value) || null;

  return (
    <Box
      sx={{
        maxWidth: '350px',
        width: '100%',
        margin: 'auto'
      }}
    >
      <Autocomplete
        options={options}
        getOptionLabel={(option) => option.label}
        onChange={handleSelectChange}
        value={selectedOption}
        renderInput={(params) => (
          <TextField
            {...params}
            label={item.title}
            variant="filled"
            sx={classes.noBorder}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {isLoading ? <LinearProgress sx={{ width: '20px' }} /> : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              )
            }}
          />
        )}
      />
    </Box>
  );
};

export default SearchDropdown;

const classes = {
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
