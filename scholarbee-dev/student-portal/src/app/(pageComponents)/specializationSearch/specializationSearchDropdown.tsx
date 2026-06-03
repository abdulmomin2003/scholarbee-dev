'use client';
import React, { useCallback } from 'react';
import {
  Autocomplete,
  Box,
  TextField,
  AutocompleteRenderInputParams,
  Typography,
  LinearProgress
} from '@mui/material';
import { useSpecializationSearch } from './useSpecializationSearch';
import { toTitleCase } from '@/utils/helperFunctions';

interface SpecializationDropdownProps {
  onChange: (name: string, value: string) => void;
  title: string;
  name: string;
  onProgramPage?: boolean;
  defaultValue?: { name: string; id: string };
  isLoading: boolean;
  options: { label: string; value: string }[];
}

interface Specialization {
  id: string;
  name: string;
}

const SpecializationSearchDropdown = ({
  onChange,
  title,
  name,
  onProgramPage,
  defaultValue,
  isLoading
}: SpecializationDropdownProps) => {
  const {
    specializations,
    selectedSpecialization,
    isFetching,
    handleInputChange,
    handleSelectChange,
    handleScroll
  } = useSpecializationSearch({
    onChange,
    name,
    defaultValue: defaultValue
      ? {
          id: defaultValue.id,
          name: toTitleCase(defaultValue.name)
        }
      : undefined
  });

  const renderInput = useCallback(
    (params: AutocompleteRenderInputParams) => (
      <TextField
        {...params}
        label={onProgramPage ? '' : title}
        placeholder="Specialization"
        name="specialization"
        variant={onProgramPage ? 'outlined' : 'filled'}
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
    ),
    [title, isLoading, onProgramPage]
  );

  return (
    <Box sx={{ maxWidth: '350px', width: '100%', margin: 'auto' }}>
      {onProgramPage && (
        <Typography
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            mb: 1
          }}
          fontWeight="medium"
          variant="body1"
          data-test-id={`select-label-${name}`}
        >
          Specialization
        </Typography>
      )}
      <Autocomplete<Specialization, false, false, false>
        options={specializations}
        getOptionLabel={(option) => option.name}
        onChange={(_, value) => handleSelectChange(value)}
        onInputChange={(_, newInputValue) => handleInputChange(newInputValue)}
        sx={{ borderRadius: '12px' }}
        loading={isFetching}
        value={selectedSpecialization}
        ListboxProps={{
          onScroll: handleScroll
        }}
        renderInput={renderInput}
        isOptionEqualToValue={(option, value) => option.id === value.id}
      />
    </Box>
  );
};

export default SpecializationSearchDropdown;

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
