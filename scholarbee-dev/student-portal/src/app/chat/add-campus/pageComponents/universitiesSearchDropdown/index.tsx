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
import { useUniversitySearch } from './useUniversitySearch';
import { toTitleCase } from '@/utils/helperFunctions';
import { COLORS } from '@/constants/colors';

interface UniversityDropdownProps {
  onChange?: (name: string, value: string) => void;
  onCampusChange?: (name: string, value: string) => void;
  title: string;
  name: string;
  onProgramPage?: boolean;
  defaultValue?: { name: string; id: string };
  variant?: 'filled' | 'outlined';
  fullWidth?: boolean;
  url?: string;
  disabled?: boolean;
  onComparePage?: boolean;
  showPlaceholder?: boolean;
}

const UniversitySearchDropdown = ({
  onChange,
  onCampusChange,
  title,
  name,
  onProgramPage = false,
  onComparePage = false,
  defaultValue,
  variant = 'filled',
  fullWidth = false,
  url,
  disabled,
  showPlaceholder
}: UniversityDropdownProps) => {
  const {
    universities,
    selectedUniversity,
    inputValue,
    isFetching,
    handleInputChange,
    handleSelectChange,
    handleScroll
  } = useUniversitySearch({
    url,
    onChange,
    onCampusChange,
    name,
    defaultValue: {
      _id: defaultValue?.id || '',
      name: toTitleCase(defaultValue?.name || '')
    }
  });

  const renderInput = useCallback(
    (params: AutocompleteRenderInputParams) => (
      <TextField
        {...params}
        {...(!onComparePage && { label: onProgramPage ? '' : title })}
        placeholder={
          showPlaceholder
            ? 'Select University'
            : !onComparePage
              ? 'University'
              : ''
        }
        name="university"
        variant={variant}
        sx={{
          backgroundColor:
            onComparePage || onProgramPage ? COLORS.white : '#F7F8F9',
          ...(variant === 'filled' && classes.noBorder)
        }}
        InputProps={{
          ...params.InputProps,
          endAdornment: (
            <React.Fragment>
              {isFetching ? <LinearProgress sx={{ width: '20px' }} /> : null}
              {params.InputProps.endAdornment}
            </React.Fragment>
          )
        }}
      />
    ),
    [onProgramPage, title, variant, onComparePage, isFetching, showPlaceholder]
  );

  return (
    <Box
      sx={{
        maxWidth: fullWidth ? '100%' : '350px',
        width: '100%',
        margin: 'auto'
      }}
    >
      {(onProgramPage || onComparePage) && (
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
          University
        </Typography>
      )}
      <Autocomplete
        disabled={disabled}
        options={universities}
        getOptionLabel={(option) => option.name}
        onChange={(event, value) => handleSelectChange(value)}
        onInputChange={(event, newInputValue) =>
          handleInputChange(newInputValue)
        }
        sx={{
          borderRadius: '12px',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
        inputValue={inputValue}
        loading={isFetching}
        value={selectedUniversity}
        ListboxProps={{
          onScroll: handleScroll
        }}
        renderInput={renderInput}
      />
    </Box>
  );
};

export default UniversitySearchDropdown;

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
