'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Skeleton,
  CircularProgress,
  InputAdornment,
  TextField,
  Drawer,
  IconButton,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CustomizedBreadcrumbs from '@/components/organisms/breadCrumbs';
import Title from '@/components/atoms/title';
import Footer from '@/components/organisms/footer';
import Navbar from '@/components/organisms/navbar';
import { COLORS } from '@/constants/colors';
import ProgramCardSkeleton from '@/components/organisms/programCardSkelton';
import {
  useScholarships,
  type UseScholarshipsInitialData
} from '../scholarships/useScholarships';
import ScholarshipCard from './components/scholarshipCard';
import { CustomTypography } from '@/components/atoms/customTypography';
import SearchIcon from '@mui/icons-material/Search';
import filterIcon from '../../../public/assets/svg/filter.svg';
import Image from 'next/image';
import { FILTER_FIELDS } from './constants';
import AutocompleteField from './components/autoCompleteField';
import type { Scholarship } from '@/types/scholarship';

const MemoizedScholarshipCard = React.memo(
  ScholarshipCard,
  (prevProps, nextProps) => {
    return (
      prevProps.scholarship._id === nextProps.scholarship._id &&
      prevProps.isFavorite === nextProps.isFavorite &&
      prevProps.isLoggedIn === nextProps.isLoggedIn
    );
  }
);

interface ScholarshipsListingClientProps {
  initialData?: UseScholarshipsInitialData | null;
}

const ScholarshipsListingClient = ({
  initialData = null
}: ScholarshipsListingClientProps) => {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);

  const {
    allScholarships,
    isLoading,
    isFetching,
    handleLoadMore,
    hasNextPage,
    totalDocs,
    handleSearchChange,
    toggleFiltersShow,
    handleChange,
    formData,
    showFilters,
    userId,
    searchValue
  } = useScholarships(initialData);

  // When we have SSR data, never show loading skeletons on first paint so server and client HTML match (avoids hydration error)
  const showAsLoading = hasMounted ? isLoading : false;
  const showAsFetching = hasMounted ? isFetching : false;
  const effectiveLoading = initialData ? showAsLoading : isLoading;
  const effectiveFetching = initialData ? showAsFetching : isFetching;

  // Use initialData only for first paint so server and client HTML match; after mount use hook (so filters/load-more update)
  const useInitialForDisplay = !hasMounted && initialData?.initialMeta != null;
  const displayTotal = useInitialForDisplay
    ? (initialData?.initialMeta?.total ?? 0)
    : (totalDocs ?? 0);
  const displayHasNextPage = useInitialForDisplay
    ? (initialData?.initialMeta?.totalPages ?? 0) > 1
    : !!hasNextPage;

  // Only use userId after mount so server and client first paint match (Cookies differ in Node vs browser)
  const effectiveUserId = hasMounted ? userId : undefined;

  const memoizedPrograms = React.useMemo(
    () =>
      allScholarships.map((scholarship: Scholarship) => (
        <Box key={scholarship?._id} mb={3}>
          <MemoizedScholarshipCard
            scholarship={scholarship}
            isFavorite={scholarship?.favouriteBy?.includes(
              effectiveUserId ?? ''
            )}
            scholarshipType={scholarship?.scholarship_type}
            offeredBy={scholarship?.organization_id?.organization_name}
            universityAddress={scholarship?.region?.region_name}
            scholarshipDeadline={scholarship?.application_deadline}
            isLoggedIn={!!effectiveUserId}
            scholarshipImage={scholarship?.image_url ?? ''}
          />
        </Box>
      )),
    [allScholarships, effectiveUserId]
  );

  return (
    <Box bgcolor={COLORS.bgColor}>
      <Navbar isCritical={false} />
      <Box bgcolor="white">
        <Container>
          <CustomizedBreadcrumbs />
          <Box mt={5} pb={3}>
            <Title title="Find The Best Education For Yourself" />
            <Typography variant="body2" fontSize={20}>
              {
                'Discover a world of academic potential with Scholarbee. From diverse programs to extensive scholarship offerings, our platform empowers learners worldwide.'
              }
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container sx={{ my: 2 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <Box sx={{ borderRadius: 2, backgroundColor: 'white', p: 2 }}>
              {!effectiveLoading && !effectiveFetching ? (
                <>
                  <CustomTypography
                    fontSize={24}
                    smallFont={18}
                    color="primary"
                    fontWeight="bold"
                    variant="h5"
                  >
                    {`${displayTotal} scholarships`}
                  </CustomTypography>
                  <Typography fontSize={14} variant="body1">
                    Match your filter & search settings
                  </Typography>
                </>
              ) : (
                <>
                  <Skeleton variant="text" width={200} height={40} />
                  <Skeleton variant="text" width={150} height={20} />
                </>
              )}
              <Box mt={2}>
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
                    placeholder="Search Scholarship"
                    aria-label="Search Scholarship"
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            {effectiveFetching ? (
                              <CircularProgress size="25px" color="inherit" />
                            ) : (
                              <SearchIcon />
                            )}
                          </InputAdornment>
                        )
                      }
                    }}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                    }}
                  />

                  {/* Filter Toggle Icon - Visible on Mobile ONLY */}
                  <Box
                    onClick={toggleFiltersShow}
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
                  {FILTER_FIELDS.map((field) => (
                    <AutocompleteField
                      key={field.name}
                      label={field.label}
                      options={field.options}
                      onChange={(value: string) =>
                        handleChange(field.name, value)
                      }
                      placeholder={field.label}
                      value={
                        formData[field.name as keyof typeof formData] as string
                      }
                    />
                  ))}
                </Box>

                {/* Mobile Drawer */}
                <Drawer
                  anchor="bottom"
                  open={showFilters}
                  onClose={toggleFiltersShow}
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
                    <IconButton onClick={toggleFiltersShow} size="small">
                      <CloseIcon />
                    </IconButton>
                  </Box>

                  <Box
                    sx={{ overflowY: 'auto', flex: 1, px: 3, py: 3, mb: 10 }}
                  >
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
                        placeholder="Search Scholarship"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon
                                fontSize="small"
                                sx={{ color: '#9A9EA6' }}
                              />
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

                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                    >
                      {FILTER_FIELDS.map((field) => (
                        <AutocompleteField
                          key={field.name}
                          label={field.label}
                          options={field.options}
                          onChange={(value: string) =>
                            handleChange(field.name, value)
                          }
                          placeholder={field.label}
                          value={
                            formData[
                              field.name as keyof typeof formData
                            ] as string
                          }
                        />
                      ))}
                    </Box>
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
                    <Button
                      onClick={() => {
                        FILTER_FIELDS.forEach((field) => {
                          handleChange(field.name, '');
                        });
                        toggleFiltersShow(); // close
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
                    </Button>
                    <Button
                      onClick={toggleFiltersShow}
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
                    </Button>
                  </Box>
                </Drawer>
              </Box>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 8, md: 9 }}>
            <Box
              sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}
            >
              {effectiveLoading ? (
                [1, 2, 3].map((item) => (
                  <ProgramCardSkeleton key={`skeleton-${item}`} />
                ))
              ) : (
                <>
                  {displayTotal ? (
                    memoizedPrograms
                  ) : (
                    <Typography
                      my={5}
                      color="text.secondary"
                      fontSize={24}
                      textAlign="center"
                    >
                      No Scholarship Found
                    </Typography>
                  )}
                </>
              )}
              {displayHasNextPage && (
                <Button
                  sx={{ px: 12, alignSelf: 'center' }}
                  variant="outlined"
                  onClick={handleLoadMore}
                  disabled={effectiveLoading || effectiveFetching}
                >
                  {effectiveLoading || effectiveFetching ? (
                    <CircularProgress size={28} color="inherit" />
                  ) : (
                    'Show More'
                  )}
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </Box>
  );
};

export default ScholarshipsListingClient;
