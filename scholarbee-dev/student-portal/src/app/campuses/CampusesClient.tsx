'use client';
import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  Skeleton,
  CircularProgress
} from '@mui/material';
import CustomizedBreadcrumbs from '@/components/organisms/breadCrumbs';
import Footer from '@/components/organisms/footer';
import { CustomTypography } from '@/components/atoms/customTypography';
import Navbar from '@/components/organisms/navbar';
import { COLORS } from '@/constants/colors';
import ProgramCardSkeleton from '@/components/organisms/programCardSkelton';
import { useGetCampusesQuery, useGetCampusRecommendationsQuery } from '@/redux/api/campusesApi';
import { usePathname, useSearchParams } from 'next/navigation';
import { useDebouncedValue } from '@/utils/useDebouncedValue';
import {
  Campus,
  QueryCampusParams,
  CampusListResponse
} from '@/types/campus.types';
import FilterSection from './(pageComponents)/filters';
import HeaderText from './(pageComponents)/headerText';
import CampusCard from './(pageComponents)/campusCard';
import PlaceholderText from '@/components/atoms/placeholderText';
import {
  ProgramListingFAQ,
  type FAQItem
} from '@/app/programs/(pageComponents)/ProgramListingFAQ';

interface CampusFilters {
  name?: string;
  city?: string;
  area?: string;
  university_type?: string;
  partner_university?: boolean;
}

interface CampusesClientProps {
  initialData: CampusListResponse | null;
  initialSearchParams: {
    name?: string;
    city?: string;
    area?: string;
    university_type?: string;
    partner_university?: boolean;
  };
  fixedCity?: string;
  pageTitle?: string;
  pageSubtitle?: string;
  introParagraphs?: string[];
  faqItems?: FAQItem[];
  showPartnerUniversityCheck?: boolean;
}

const decodeParam = (value: string | null): string =>
  value ? decodeURIComponent(value) : '';

const CampusCardsList = memo(
  ({ campuses }: { campuses: Campus[] }) => {
    return (
      <>
        {campuses?.map((campus) => (
          <CampusCard
            key={campus._id}
            campus={campus}
            showFavoriteButton={false}
          />
        ))}
      </>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.campuses.length !== nextProps.campuses.length) {
      return false;
    }

    return prevProps.campuses.every((prevCampus, index) => {
      const nextCampus = nextProps.campuses[index];
      return (
        prevCampus._id === nextCampus._id &&
        prevCampus.isFavorite === nextCampus.isFavorite
      );
    });
  }
);

CampusCardsList.displayName = 'CampusCardsList';

const CampusesClient: React.FC<CampusesClientProps> = ({
  initialData,
  initialSearchParams,
  fixedCity = '',
  pageTitle,
  pageSubtitle,
  introParagraphs,
  faqItems,
  showPartnerUniversityCheck = false
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const initialName = useMemo(() => {
    const fromUrl = decodeParam(searchParams.get('name'));
    return fromUrl || initialSearchParams.name || '';
  }, [searchParams, initialSearchParams.name]);

  const initialCity = useMemo(() => {
    const fromUrl = decodeParam(searchParams.get('city'));
    return fixedCity || fromUrl || initialSearchParams.city || '';
  }, [searchParams, fixedCity, initialSearchParams.city]);

  const initialArea = useMemo(() => {
    const fromUrl = decodeParam(searchParams.get('area'));
    return fromUrl || initialSearchParams.area || '';
  }, [searchParams, initialSearchParams.area]);

  const initialUniversityType = useMemo(() => {
    const fromUrl = decodeParam(searchParams.get('university_type'));
    return fromUrl || initialSearchParams.university_type || '';
  }, [searchParams, initialSearchParams.university_type]);

  const initialPartnerUniversity = useMemo(() => {
    const fromUrl = searchParams.get('partner_university') === 'true';
    return fromUrl || Boolean(initialSearchParams.partner_university);
  }, [searchParams, initialSearchParams.partner_university]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('programNavigationSource', 'universities');
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const queryString = searchParams.toString();
    const currentListingUrl = queryString
      ? `${pathname}?${queryString}`
      : pathname;
    sessionStorage.setItem('universitiesListingUrl', currentListingUrl);
  }, [pathname, searchParams]);

  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [formData, setFormData] = useState<CampusFilters>({
    name: initialName,
    city: initialCity,
    area: initialArea,
    university_type: initialUniversityType,
    partner_university: initialPartnerUniversity
  });

  const hasUrlDrivenFilters = useMemo(() => {
    return [
      'name',
      'city',
      'area',
      'university_type',
      'partner_university'
    ].some((key) => Boolean(searchParams.get(key)));
  }, [searchParams]);

  const [page, setPage] = useState<number>(1);
  const [allCampuses, setAllCampuses] = useState<Campus[]>(
    hasUrlDrivenFilters || fixedCity ? [] : (initialData?.data ?? [])
  );
  const [searchValue, setSearchValue] = useState<string>(initialName);
  const debouncedSearchValue = useDebouncedValue(searchValue, 300);

  // Create a stable query params object with consistent structure
  const queryParams: QueryCampusParams = useMemo(() => {
    const params: QueryCampusParams = {
      page,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    // Use debouncedSearchValue as the single source of truth for name search
    if (debouncedSearchValue && debouncedSearchValue.trim()) {
      params.name = debouncedSearchValue.trim();
    }
    const cityValue = fixedCity || (formData.city && formData.city.trim());
    if (cityValue) {
      params.city = cityValue.trim();
    }
    if (formData.area && formData.area.trim()) {
      params.area = formData.area.trim();
    }
    if (formData.university_type && formData.university_type.trim()) {
      params.university_type = formData.university_type.trim();
    }
    if (formData.partner_university) {
      params.partner_university = true;
    }

    return params;
  }, [
    page,
    debouncedSearchValue,
    formData.city,
    formData.area,
    formData.university_type,
    formData.partner_university,
    fixedCity
  ]);

  const hasActiveFilters = useMemo(() => {
    if (fixedCity) return true;
    if (hasUrlDrivenFilters) return true;

    const trimmedSearch = debouncedSearchValue.trim();
    if (trimmedSearch.length >= 2) return true;

    return Boolean(
      formData.city ||
        formData.area ||
        formData.university_type ||
        formData.partner_university
    );
  }, [
    fixedCity,
    hasUrlDrivenFilters,
    debouncedSearchValue,
    formData.city,
    formData.area,
    formData.university_type,
    formData.partner_university
  ]);

  const shouldUseRecommendations = !hasActiveFilters;

  const {
    data: recommendationsResponse,
    isLoading: recsLoading,
    isFetching: recsFetching
  } = useGetCampusRecommendationsQuery(
    { page, limit: 10 },
    { skip: !shouldUseRecommendations }
  );

  const {
    data: campusesResponse,
    isLoading,
    isFetching
  } = useGetCampusesQuery(queryParams, { skip: shouldUseRecommendations });

  const activeResponse = shouldUseRecommendations
    ? recommendationsResponse
    : campusesResponse;
  const activeLoading = shouldUseRecommendations ? recsLoading : isLoading;
  const activeFetching = shouldUseRecommendations ? recsFetching : isFetching;

  // Update URL params when filters or debounced search change
  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedSearchValue && debouncedSearchValue.trim()) {
      params.set('name', debouncedSearchValue.trim());
    }
    if (!fixedCity && formData.city && formData.city.trim()) {
      params.set('city', formData.city.trim());
    }
    if (formData.area && formData.area.trim()) {
      params.set('area', formData.area.trim());
    }
    if (formData.university_type && formData.university_type.trim()) {
      params.set('university_type', formData.university_type.trim());
    }
    if (formData.partner_university) {
      params.set('partner_university', 'true');
    }

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    window.history.replaceState({}, '', newUrl);
  }, [
    formData.city,
    formData.area,
    formData.university_type,
    formData.partner_university,
    debouncedSearchValue,
    pathname,
    fixedCity
  ]);

  // Handle data updates from RTK Query
  useEffect(() => {
    if (activeResponse?.data && !activeFetching) {
      setAllCampuses((prevCampuses) => {
        if (page === 1) {
          return activeResponse.data;
        }

        if (activeResponse.data.length === 0) {
          return prevCampuses;
        }

        const existingIds = new Set(prevCampuses.map((c) => c._id));
        const newCampuses = activeResponse.data.filter(
          (campus) => !existingIds.has(campus._id)
        );

        if (newCampuses.length === 0) {
          return prevCampuses;
        }

        return prevCampuses.concat(newCampuses);
      });
    }
  }, [activeResponse, page, activeFetching]);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchValue(value);
      setPage(1);
    },
    []
  );

  const handleChange = useCallback(
    (name: string, value: string) => {
      if (fixedCity && name === 'city') return;
      setPage(1);
      if (name === 'partner_university') {
        setFormData((prev) => ({
          ...prev,
          partner_university: value === 'true'
        }));
        return;
      }

      const newValue = value && value.trim() ? value.trim() : '';
      setFormData((prev) => ({ ...prev, [name]: newValue || undefined }));
    },
    [fixedCity]
  );

  const handleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  const handleLoadMore = useCallback(() => {
    setPage((prevPage) => prevPage + 1);
  }, []);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'), {
    noSsr: true
  });

  // Use server data for initial render, then switch to client data
  const currentResponse = activeResponse || initialData;
  const totalDocs = currentResponse?.meta?.total || 0;
  const hasNextPage =
    currentResponse?.meta &&
    currentResponse.meta.page < currentResponse.meta.pages;

  const isInitialLoading = activeLoading && !allCampuses.length;
  const isCurrentlyLoading = activeLoading || activeFetching;

  let campusCountContent: React.ReactNode;
  if (!activeLoading && !activeFetching) {
    campusCountContent = (
      <>
        <CustomTypography
          fontSize={24}
          smallFont={18}
          color="primary"
          fontWeight="bold"
          variant="h5"
        >
          {`${totalDocs} Campuses`}
        </CustomTypography>
        <Typography fontSize={14} variant="body1">
          Match your filter & search settings
        </Typography>
      </>
    );
  } else if (initialData?.meta?.total != null) {
    campusCountContent = (
      <>
        <CustomTypography
          fontSize={24}
          smallFont={18}
          color="primary"
          fontWeight="bold"
          variant="h5"
        >
          {`${initialData.meta.total} Campuses`}
        </CustomTypography>
        <Typography fontSize={14} variant="body1">
          Match your filter & search settings
        </Typography>
      </>
    );
  } else {
    campusCountContent = (
      <>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="text" width={150} height={20} />
      </>
    );
  }

  let listingContent: React.ReactNode;
  if (isInitialLoading) {
    listingContent = Array.from({ length: 5 }).map((_, position) => (
      <ProgramCardSkeleton key={`skeleton-position-${position + 1}`} />
    ));
  } else if (totalDocs) {
    listingContent = <CampusCardsList campuses={allCampuses} />;
  } else {
    listingContent = <PlaceholderText text="No Campus Found" />;
  }

  return (
    <Box bgcolor={COLORS.bgColor}>
      <Navbar isCritical={false} />
      <Box bgcolor="white">
        <Container>
          <CustomizedBreadcrumbs />
          {pageTitle || pageSubtitle || introParagraphs?.length ? (
            <Box mt={5} pb={3} sx={{ margin: '0 auto' }}>
              {pageTitle && (
                <Typography
                  component="h1"
                  variant="h4"
                  fontWeight={700}
                  sx={{
                    color: '#070808',
                    fontSize: { xs: '1.75rem', md: '2.25rem' },
                    lineHeight: 1.25,
                    mt: 2,
                    mb: 2
                  }}
                >
                  {pageTitle}
                </Typography>
              )}
              {introParagraphs?.length
                ? introParagraphs.map((para) => (
                    <Typography
                      key={para.slice(0, 40)}
                      variant="body1"
                      sx={{
                        color: '#444850',
                        lineHeight: 1.7,
                        mb: 2.5
                      }}
                    >
                      {para}
                    </Typography>
                  ))
                : pageSubtitle && (
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#444850',
                        fontSize: { xs: '0.9375rem', md: '1rem' },
                        lineHeight: 1.7
                      }}
                    >
                      {pageSubtitle}
                    </Typography>
                  )}
            </Box>
          ) : (
            <HeaderText />
          )}
        </Container>
      </Box>

      <Container sx={{ my: 2 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <Box sx={{ borderRadius: 2, backgroundColor: 'white', padding: 2 }}>
              {campusCountContent}
              <FilterSection
                formData={formData}
                handleChange={handleChange}
                handleSearchChange={handleSearchChange}
                handleFilters={handleFilters}
                showFilters={showFilters}
                isFetching={isCurrentlyLoading}
                isSmallScreen={isSmallScreen}
                searchValue={searchValue}
                hideCityField={!!fixedCity}
                showPartnerUniversityCheck={showPartnerUniversityCheck}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 8, md: 9 }}>
            <Box
              sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}
            >
              {listingContent}
              {hasNextPage && (
                <Button
                  sx={{ px: 12, alignSelf: 'center', mt: 2 }}
                  variant="outlined"
                  onClick={handleLoadMore}
                  disabled={isInitialLoading || isCurrentlyLoading}
                >
                  {isInitialLoading || isCurrentlyLoading ? (
                    <CircularProgress color="inherit" />
                  ) : (
                    'Show More'
                  )}
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
      {faqItems?.length ? <ProgramListingFAQ items={faqItems} /> : null}
      <Footer />
    </Box>
  );
};

export default CampusesClient;
