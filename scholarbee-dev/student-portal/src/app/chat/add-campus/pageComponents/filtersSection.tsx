/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Grid } from '@mui/material';
import React from 'react';
import CampusSelect from './campusSelect';
import UniversitySelect from '../../../../components/atoms/universitySelect';

const FiltersSection = (props: any) => {
  return (
    <Box>
      <Grid spacing={2} container>
        <Grid size={{ xs: 12, md: 6 }} sx={{ mb: 2 }}>
          <UniversitySelect {...props} showPlaceholder />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} sx={{ mb: 2 }}>
          <CampusSelect
            fullWidth
            showPlaceholder
            campusSearchInput={props?.campusSearchInput}
            setCampusSearchInput={props?.setCampusSearchInput}
            allCampuses={props?.allCampuses}
            {...props}
          />
        </Grid>
        {/* <Grid
          size={{ xs: 12, md: 2 }}
          sx={{
            mb: 2,
            display: 'flex',
            alignItems: 'flex-end',
            width: '100%'
          }}
        >
          <Button
            variant="contained"
            fullWidth
            onClick={handleSearch}
            sx={{
              height: '56px',
              width: '100%',
              maxWidth: '100%'
            }}
          >
            Search
          </Button>
        </Grid> */}
      </Grid>
    </Box>
  );
};

export default FiltersSection;
