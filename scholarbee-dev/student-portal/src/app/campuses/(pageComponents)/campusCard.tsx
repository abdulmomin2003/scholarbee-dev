import {
  Box,
  Divider,
  Grid,
  Typography,
  Chip,
  SxProps,
  Theme
} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useMemo, memo } from 'react';
import { Campus } from '@/types/campus.types';
import { useFavoriteCampus } from '@/hooks/useFavoriteCampus';
import { isDomainAllowed, toUrlSlug } from '@/utils/helperFunctions';
import CampusFavoriteButton from './campusFavoriteButton';

const userId = Cookies.get('userId') ?? null;

interface CampusCardProps {
  campus: Campus;
  isLoading?: boolean;
  showFavoriteButton?: boolean;
}

const CampusCard = memo(
  ({
    campus,
    isLoading = false,
    showFavoriteButton = true
  }: CampusCardProps) => {
    const {
      handleAddFavoriteCampus,
      isAddingFavoriteCampus,
      isRemovingFavoriteCampus,
      handleRemoveFavoriteCampus
    } = useFavoriteCampus();

    const isProcessingOrRemoving =
      isAddingFavoriteCampus || isRemovingFavoriteCampus;

    const university =
      typeof campus.university_id === 'object' ? campus.university_id : null;
    const address =
      typeof campus.address_id === 'object'
        ? campus.address_id
        : campus.address;

    const campusUrl = useMemo(() => {
      if (!address || !university) return undefined;

      const citySlug = address?.city?.toLowerCase() || '';
      const campusSlug = campus?.slug || '';
      const uniBaseName =
        (typeof university === 'object' &&
          (university.slug ||
            university.name ||
            (university as { university_name?: string }).university_name)) ||
        '';
      const uniSlug = uniBaseName ? toUrlSlug(uniBaseName) : '';

      if (!citySlug || !uniSlug) return undefined;

      // University detail URL: /universities/[city]/[uni-slug]/
      // return `/universities/${encodeURIComponent(citySlug)}/${university?.slug}`;
      return `/universities/${encodeURIComponent(citySlug)}/${campusSlug}`;
    }, [address, campus?.slug, university]);

    // console.log({ campusUrl });

    const location = useMemo(() => {
      if (!address) return 'Location not available';
      const parts = [address.city, address.state, address.country].filter(
        Boolean
      );
      return parts.join(', ') || 'Location not available';
    }, [address]);

    const establishedYear = useMemo(() => {
      if (!campus.established_date) return 'N/A';
      const date = new Date(campus.established_date);
      return date.getFullYear().toString();
    }, [campus.established_date]);

    const campusArea = useMemo(() => {
      if (!campus.campus_area) return 'N/A';
      // Format as acres
      return `${campus.campus_area.toLocaleString()} acres`;
    }, [campus.campus_area]);

    const logoUrl = useMemo(() => {
      // Only use the campus logo; fall back to a static placeholder
      return campus.logo_url || '/assets/png/university_placeholder.png';
    }, [campus.logo_url]);

    const favoriteButton = useMemo(
      () => (
        <>
          {userId ? (
            <CampusFavoriteButton
              campusId={campus._id}
              isFavorite={campus.isFavorite || false}
              addCampusToFavorite={handleAddFavoriteCampus}
              removeCampusFromFavorite={handleRemoveFavoriteCampus}
              isAddingToFavorite={isAddingFavoriteCampus}
              isRemovingFromFavorite={isRemovingFavoriteCampus}
              isProcessingOrRemoving={isProcessingOrRemoving || isLoading}
            />
          ) : null}
        </>
      ),
      [
        campus._id,
        campus.isFavorite,
        handleAddFavoriteCampus,
        handleRemoveFavoriteCampus,
        isAddingFavoriteCampus,
        isRemovingFavoriteCampus,
        isProcessingOrRemoving,
        isLoading
      ]
    );

    const isLinkDisabled =
      isLoading || isProcessingOrRemoving || !campusUrl || !campusUrl.trim();

    return (
      <Box sx={styles.container(isProcessingOrRemoving || isLoading)}>
        <Grid container spacing={2} alignItems={'stretch'} height={'100%'}>
          <Grid size={{ xs: 12, md: 4 }} sx={styles.logoContainer}>
            <Image
              src={
                isDomainAllowed(logoUrl)
                  ? logoUrl
                  : '/assets/png/university_placeholder.png'
              }
              alt="campus-logo"
              width={332}
              height={251}
              objectFit="cover"
              style={styles.logoImage}
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={styles.cardInfo}>
              <Box sx={styles.cardDetails}>
                <Box>
                  <Box sx={styles.titleContainer}>
                    <Typography
                      variant="h5"
                      fontWeight="600"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.2,
                        maxHeight: '2.4em',
                        flex: 1
                      }}
                    >
                      {campus.name}
                    </Typography>
                    {showFavoriteButton && <>{favoriteButton}</>}
                  </Box>
                  {university && (
                    <Box sx={styles.infoRow}>
                      <Box sx={styles.locationContainer}>
                        <Typography variant="body1" color="grey.700">
                          {location}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
                <Box gap={1} sx={styles.programDetails}>
                  <Box sx={styles.detailRow}>
                    <Image
                      src="/assets/svg/clock-blue.svg"
                      alt="established"
                      color="red"
                      width={24}
                      height={24}
                      priority
                    />
                    <Box>
                      <Typography sx={styles.statsText} variant="body2">
                        Established in
                      </Typography>
                      <Typography
                        sx={styles.statsText}
                        variant="body1"
                        fontWeight="600"
                      >
                        {establishedYear}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={styles.divider}
                  />
                  <Box sx={styles.detailRow}>
                    <Image
                      src="/assets/svg/buildings.svg"
                      alt="campus area"
                      width={24}
                      height={24}
                      priority
                    />
                    <Box>
                      <Typography sx={styles.statsText} variant="body2">
                        Campus Area
                      </Typography>
                      <Typography
                        sx={styles.statsText}
                        variant="body1"
                        fontWeight="600"
                      >
                        {campusArea}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={styles.divider}
                  />
                  <Box sx={styles.detailRow}>
                    <Image
                      src="/assets/svg/buildings.svg"
                      alt="residential facilities"
                      width={24}
                      height={24}
                      priority
                    />
                    <Box>
                      <Typography sx={styles.statsText} variant="body2">
                        Accommodation
                      </Typography>
                      <Typography
                        sx={styles.statsText}
                        variant="body1"
                        fontWeight="600"
                      >
                        {campus.residential_facilities ? 'Available' : 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Link
                  href={isLinkDisabled ? '#' : campusUrl || '#'}
                  prefetch={true}
                  style={{
                    marginTop: 'auto',
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block',
                    width: '100%',
                    pointerEvents: isLinkDisabled ? 'none' : 'auto'
                  }}
                  onClick={(e) => {
                    if (isLinkDisabled) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                >
                  <Box
                    className={`view-campus ${
                      isLinkDisabled ? 'disabled' : ''
                    }`}
                    sx={{
                      ...styles.viewCampusButton,
                      ...(isLinkDisabled && {
                        backgroundColor: 'grey.400',
                        color: 'grey.100',
                        cursor: 'default'
                      })
                    }}
                  >
                    View Campus Detail
                  </Box>
                </Link>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.campus._id === nextProps.campus._id &&
      prevProps.campus.isFavorite === nextProps.campus.isFavorite &&
      prevProps.isLoading === nextProps.isLoading
    );
  }
);

CampusCard.displayName = 'CampusCard';

export default CampusCard;

const styles = {
  container: (isProcessing: boolean): SxProps<Theme> => ({
    cursor: 'default',
    pointerEvents: isProcessing ? 'none' : 'auto',
    opacity: isProcessing ? 0.4 : 1,
    transition: 'opacity 0.2s ease-in-out',
    mb: 3,
    borderRadius: 2,
    backgroundColor: 'white',
    padding: 2,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: { xs: 'auto', md: 300 },
    '&:hover': {
      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
      '& .view-campus:not(.disabled)': {
        backgroundColor: 'primary.dark'
      }
    }
  }),
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    // minHeight: '200px',
    // maxHeight: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: '12px',
    overflow: 'hidden'
    // padding: 2
  },
  logoImage: {
    objectFit: 'cover',
    borderRadius: '12px',
    height: '100%',
    width: '100%'
  } as React.CSSProperties,
  cardInfo: {
    display: 'flex',
    height: '100%'
  },
  cardDetails: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 1,
    mt: 2,
    alignItems: 'flex-start'
  },
  infoRow: {
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    alignItems: {
      xs: 'flex-start',
      md: 'center'
    },
    gap: 2,
    mt: 1
  },
  universityLogo: {
    width: 'auto',
    maxWidth: '120px',
    height: '60px',
    objectFit: 'contain'
  } as React.CSSProperties,
  locationContainer: {
    display: 'flex',
    // Add a gray color
    // color: 'grey.500',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    mb: { xs: 1, md: 2 }
  },
  programDetails: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: {
      xs: 'column',
      sm: 'row'
    }
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    mt: 1
  },
  divider: {
    margin: { xs: 0.5, lg: 1 },
    display: {
      xs: 'none',
      md: 'block'
    }
  },
  statsText: {
    fontSize: { xs: 12, sm: 14 }
  },
  viewCampusButton: {
    p: 2,
    borderRadius: 2,
    backgroundColor: 'primary.main',
    textAlign: 'center',
    color: 'white',
    mt: 2,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease-in-out',
    fontWeight: 600
  }
};
