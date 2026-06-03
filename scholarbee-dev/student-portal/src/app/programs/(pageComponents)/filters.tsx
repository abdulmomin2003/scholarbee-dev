import React, { useMemo, useState } from 'react';
import {
  Box,
  InputAdornment,
  TextField,
  CircularProgress,
  Autocomplete,
  Typography,
  Drawer,
  IconButton,
  Button as MuiButton,
  Divider
} from '@mui/material';
import { OPTIONS } from '@/constants';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { FilterSectionProps } from '@/types';
import Image from 'next/image';
import filterIcon from '@public/assets/svg/filter.svg';
import UniversitySearchDropdown from '@/app/(pageComponents)/universitiesSearchDropdown';
import { StipendAmountOptions } from '@/app/search-scholarship/constants';
import { useGetCitiesQuery } from '@/redux/api/programApi';
import type { CityOption } from '@/redux/api/programApi';

interface AutocompleteFieldProps {
  label: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
  disabled?: boolean;
}

const AutocompleteField: React.FC<AutocompleteFieldProps> = ({
  label,
  options,
  onChange,
  placeholder,
  value,
  disabled = false
}) => (
  <Box sx={{ mb: 2 }}>
    <Typography
      sx={{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        mb: 1
      }}
      fontWeight="medium"
      variant="body1"
    >
      {label}
    </Typography>
    <Autocomplete
      onChange={(event, newValue) => onChange(newValue?.value || '')}
      disablePortal
      options={options}
      value={options?.find((option) => option.value === value) || null}
      getOptionDisabled={() => disabled}
      sx={{ width: '100%', borderRadius: '12px' }}
      renderInput={(params) => (
        <TextField
          placeholder={placeholder}
          {...params}
          label=""
          disabled={disabled}
        />
      )}
    />
  </Box>
);

const FilterSection: React.FC<FilterSectionProps> = ({
  formData,
  handleChange,
  handleUniversityChange,
  handleSearchChange,
  handleReset,
  // handleFilters,
  // showFilters,
  isFetching,
  // isSmallScreen,
  uniqueDegreeLevels,
  uniqueMajors,
  searchValue,
  hideMajorField = false,
  hideCityField = false
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: citiesResponse } = useGetCitiesQuery();

  const cityOptions = useMemo(() => {
    if (!Array.isArray(citiesResponse) || citiesResponse.length === 0) {
      return OPTIONS.cities;
    }

    return citiesResponse
      .map((city: CityOption) => ({
        label: city?.label ?? '',
        value: city?.value ?? ''
      }))
      .filter((city) => city.label && city.value);
  }, [citiesResponse]);

  const filterFields = [
    {
      name: 'city',
      label: 'City',
      options: cityOptions
    },
    { name: 'degree_level', label: 'Study Level', options: uniqueDegreeLevels },
    {
      name: 'major',
      label: 'Field of Study',
      options: uniqueMajors
    },
    {
      name: 'status',
      label: 'Admission Status',
      options: [
        { label: 'Open', value: 'open' },
        { label: 'Closed', value: 'closed' },
        { label: 'Closing Soon', value: 'closingSoon' },
        { label: 'Opening Soon', value: 'openingSoon' }
      ]
    },
    {
      name: 'courseForm',
      label: 'Course Format',
      options: OPTIONS.courseFormat
    },
    { name: 'year', label: 'Year', options: OPTIONS.year },
    { name: 'intake', label: 'Admission Session', options: OPTIONS.intake },
    {
      name: 'fee',
      label: 'Fee Range',
      options: StipendAmountOptions
    }
  ];

  const universityDefaultValue = useMemo(() => {
    return formData?.university && formData?.university.trim() !== ''
      ? {
          name: formData?.university,
          id: formData?.universityId
        }
      : null;
  }, [formData?.university, formData?.universityId]);

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }
      setDrawerOpen(open);
    };

  const memoizedUniversityDropdown = useMemo(() => {
    return (
      <UniversitySearchDropdown
        onChange={(name, value) => {
          handleUniversityChange(name, value);
        }}
        showPlaceholder
        title="Select University"
        name="university"
        onProgramPage
        variant="outlined"
        defaultValue={universityDefaultValue || undefined}
        fullWidth={true}
      />
    );
  }, [handleUniversityChange, universityDefaultValue]);

  const filterContent = (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 1 }}
    >
      {memoizedUniversityDropdown}
      {filterFields
        .filter(
          (field) =>
            (field.name !== 'major' || !hideMajorField) &&
            (field.name !== 'city' || !hideCityField)
        )
        .map((field) => (
          <AutocompleteField
            key={field.name}
            label={field.label}
            options={field.options}
            onChange={(value) => handleChange(field.name, value)}
            placeholder={field.label}
            value={String(formData[field.name as keyof typeof formData] || '')}
            disabled={
              'disabled' in field && typeof field.disabled === 'boolean'
                ? field.disabled
                : false
            }
          />
        ))}
    </Box>
  );

  return (
    <Box mt={2} id="filter-section-container">
      {/* Search Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 1.5,
          alignItems: 'flex-start'
        }}
      >
        <TextField
          value={searchValue || ''}
          onChange={handleSearchChange}
          variant="outlined"
          fullWidth
          placeholder="Search Admission"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {isFetching ? (
                  <CircularProgress size="25px" color="inherit" />
                ) : (
                  <SearchIcon />
                )}
              </InputAdornment>
            )
          }}
          sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
        />

        {/* Filter Toggle Icon - Visible on Mobile ONLY via CSS */}
        <Box
          onClick={toggleDrawer(true)}
          sx={{
            display: { xs: 'flex', sm: 'none' }, // Use CSS media queries to prevent FOUC
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F1F2F3',
            borderRadius: '12px',
            cursor: 'pointer',
            border: '1px solid #E4E5E7',
            height: '56px',
            width: '56px',
            flexShrink: 0,
            '&:hover': {
              backgroundColor: '#E4E5E7'
            }
          }}
        >
          <Image
            src={filterIcon}
            alt="filter icons"
            width={24}
            height={24}
            style={{ objectFit: 'contain' }}
          />
        </Box>
      </Box>

      {/* Web View: ALWAYS visible inline, hidden on mobile via CSS */}
      <Box sx={{ mt: 1, display: { xs: 'none', sm: 'block' } }}>
        {filterContent}
      </Box>

      {/* Mobile Drawer: Only rendered when opened, but its trigger icon is CSS-controlled */}
      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            maxHeight: '90vh',
            p: 0
          }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 2,
            borderBottom: '1px solid #F1F2F3'
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            Filters
          </Typography>
          <IconButton onClick={toggleDrawer(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ overflowY: 'auto', flex: 1, px: 3, py: 3, mb: 10 }}>
          {/* Search within Drawer */}
          <Box sx={{ mb: 4 }}>
            <Typography
              sx={{ mb: 1.5, color: '#464A50', fontSize: '14px' }}
              fontWeight={600}
            >
              Search
            </Typography>
            <TextField
              value={searchValue || ''}
              onChange={handleSearchChange}
              variant="outlined"
              fullWidth
              placeholder="Search Admission"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: '#9A9EA6' }} />
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  height: '48px',
                  backgroundColor: '#FFF'
                },
                '& .MuiInputBase-input': {
                  fontSize: '14px'
                }
              }}
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          {filterContent}
        </Box>

        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2.5,
            backgroundColor: '#FFF',
            display: 'flex',
            gap: 2,
            borderTop: '1px solid #F1F2F3',
            boxShadow: '0 -4px 12px rgba(0,0,0,0.05)'
          }}
        >
          <MuiButton
            onClick={() => {
              handleReset();
              setDrawerOpen(false);
            }}
            fullWidth
            variant="outlined"
            sx={{
              borderRadius: '12px',
              height: '52px',
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Clear All
          </MuiButton>
          <MuiButton
            onClick={toggleDrawer(false)}
            fullWidth
            variant="contained"
            sx={{
              borderRadius: '12px',
              height: '52px',
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: '#004AE0'
            }}
          >
            Apply Filters
          </MuiButton>
        </Box>
      </Drawer>
    </Box>
  );
};

export default React.memo(FilterSection);
