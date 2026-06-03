import React, { useMemo } from 'react';
import {
  Box,
  InputAdornment,
  TextField,
  CircularProgress,
  Autocomplete,
  Typography,
  FormControlLabel,
  Checkbox,
  Drawer,
  IconButton,
  Button as MuiButton,
  Divider
} from '@mui/material';
import { CITIES } from '@/constants';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';
import filterIcon from '@public/assets/svg/filter.svg';

const UNIVERSITY_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'private', label: 'Private' },
  { value: 'government', label: 'Government' },
  { value: 'semi-government', label: 'Semi Government' },
  { value: 'tni', label: 'TNI' }
];

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
      onChange={(event, selectedValue) => onChange(selectedValue?.value || '')}
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

interface FilterSectionProps {
  formData: {
    name?: string;
    city?: string;
    area?: string;
    university_type?: string;
    partner_university?: boolean;
  };
  handleChange: (name: string, value: string) => void;
  handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleFilters: () => void;
  showFilters: boolean;
  isFetching: boolean;
  isSmallScreen: boolean;
  searchValue: string;
  hideCityField?: boolean;
  showPartnerUniversityCheck?: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  formData,
  handleChange,
  handleSearchChange,
  handleFilters,
  showFilters,
  isFetching,
  searchValue,
  hideCityField = false,
  showPartnerUniversityCheck = false
}) => {
  const cityOptions = useMemo(
    () => CITIES.map((city) => ({ value: city.label, label: city.label })),
    []
  );

  const filterContent = (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 1 }}
    >
      {!hideCityField && (
        <AutocompleteField
          label="City"
          options={cityOptions}
          onChange={(value) => handleChange('city', value)}
          placeholder="Select City"
          value={formData.city || ''}
        />
      )}
      <AutocompleteField
        label="University Type"
        options={UNIVERSITY_TYPE_OPTIONS}
        onChange={(value) => handleChange('university_type', value)}
        placeholder="Select University Type"
        value={formData.university_type || ''}
      />
      {showPartnerUniversityCheck && (
        <FormControlLabel
          sx={{ mb: 1 }}
          control={
            <Checkbox
              checked={Boolean(formData.partner_university)}
              onChange={(event) =>
                handleChange(
                  'partner_university',
                  event.target.checked ? 'true' : ''
                )
              }
            />
          }
          label="Partner Universities Only"
        />
      )}
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
          placeholder="Campus Name"
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

        {/* Filter Toggle Icon - Visible on Mobile ONLY */}
        <Box
          onClick={handleFilters}
          sx={{
            display: { xs: 'flex', sm: 'none' },
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

      {/* Mobile Drawer */}
      <Drawer
        anchor="bottom"
        open={showFilters}
        onClose={handleFilters}
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
          <IconButton onClick={handleFilters} size="small">
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
              placeholder="Campus Name"
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
              handleChange('city', '');
              handleChange('university_type', '');
              handleChange('partner_university', '');
              handleFilters(); // close
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
            onClick={handleFilters}
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
