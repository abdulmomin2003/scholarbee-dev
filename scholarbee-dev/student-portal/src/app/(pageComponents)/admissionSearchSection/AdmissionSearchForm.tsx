'use client';
import { useGetDegreeLevelsQuery } from '@/redux/api/majorApi';
import { getFormattedMajorsAndDegreeLevels } from '@/utils/helperFunctions';
import { Grid, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';
import SearchDropdown from '../seachDropdown';
import SearchButton from '../searchButton';
import UniversitySearchDropdown from '../universitiesSearchDropdown';

const AdmissionSearchForm = () => {
  const [filtersForm, setFiltersForm] = useState({
    universityId: '',
    university: '',
    degree_level: '',
    search: ''
  });
  const [searchValue, setSearchValue] = useState<string>('');

  const handleChange = (name: string, value: string) => {
    setFiltersForm((prevState) => {
      if (name === 'university') {
        setSearchValue(''); // Reset search value state
        return {
          ...prevState,
          university: value,
          degree_level: '', // Reset program type
          search: '' // Reset search
        };
      } else if (name === 'universityId') {
        return {
          ...prevState,
          universityId: value
        };
      }

      // For other field changes, just update that field
      return {
        ...prevState,
        [name]: value
      };
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    handleChange('search', value);
  };

  const {
    data: degreeLevelsPrograms,
    isLoading: isLoadingDegreeLevels,
    isFetching: isFetchingDegreeLevels
  } = useGetDegreeLevelsQuery({
    university_id: filtersForm?.universityId
  });

  const programsTypes = {
    id: 2,
    title: 'Program Type',
    name: 'degree_level'
  };

  return (
    <>
      <Grid container spacing={2} my={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <UniversitySearchDropdown
            showPlaceholder={false}
            onChange={handleChange}
            title="Select University"
            name="university"
            variant="filled"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <SearchDropdown
            isLoading={isFetchingDegreeLevels || isLoadingDegreeLevels}
            onChange={handleChange}
            item={programsTypes}
            options={
              isFetchingDegreeLevels || isLoadingDegreeLevels
                ? []
                : getFormattedMajorsAndDegreeLevels(degreeLevelsPrograms)
            }
            value={filtersForm.degree_level}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            value={searchValue || ''}
            onChange={handleSearchChange}
            variant="filled"
            fullWidth
            label="Search Admission"
            sx={classes.noBorder}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Grid>
      </Grid>
      <SearchButton filtersForm={filtersForm} />
    </>
  );
};

export default AdmissionSearchForm;

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
