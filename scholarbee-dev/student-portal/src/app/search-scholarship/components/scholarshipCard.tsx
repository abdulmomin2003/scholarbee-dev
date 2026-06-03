import {
  formatAdmissionDeadline,
  formatMoney,
  isDomainAllowed
} from '@/utils/helperFunctions';
import { Box, Button, Divider, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import Cookies from 'js-cookie';

import { styles } from '../styles';
import { CustomTypography } from '@/components/atoms/customTypography';
import FavoriteButton from './favoriteButton';
import { Scholarship } from '@/types/scholarship';
import { useCallback } from 'react';
import {
  useAddScholarshipToFavoriteMutation,
  useRemoveScholarshipFromFavoriteMutation
} from '@/redux/api/scholarshipApi';

const ScholarshipCard = ({
  scholarship,
  isFavorite,
  programTitle,
  scholarshipType,
  scholarshipDeadline,
  universityAddress,
  isLoggedIn,
  offeredBy,
  scholarshipImage,
  scholarshipAmount,
  outlined
}: {
  scholarship: Scholarship;
  isFavorite?: boolean;
  programTitle?: string;
  scholarshipType?: string;
  scholarshipDeadline?: string;
  universityAddress?: string;
  isLoggedIn?: boolean;
  offeredBy: string;
  scholarshipImage: string;
  scholarshipAmount?: number;
  outlined?: boolean;
}) => {
  const { formattedDate, hasPassed } = scholarshipDeadline
    ? formatAdmissionDeadline(scholarshipDeadline)
    : { formattedDate: '', hasPassed: false };

  const scholarshipId = scholarship?._id;
  const scholarshipUrl = scholarshipId
    ? `/scholarship-details/${scholarshipId}`
    : '';

  const userId = Cookies.get('userId');

  const [addScholarshipToFavoriteMutation, { isLoading: isAddingToFavorite }] =
    useAddScholarshipToFavoriteMutation();
  const [
    removeScholarshipFromFavoriteMutation,
    { isLoading: isRemovingFromFavorite }
  ] = useRemoveScholarshipFromFavoriteMutation();

  const addScholarshipToFavorite = useCallback(
    async (scholarshipId: string) => {
      if (!userId || !scholarshipId) return;
      try {
        await addScholarshipToFavoriteMutation(scholarshipId).unwrap();
      } catch (error) {
        console.error('Failed to add scholarship to favorites:', error);
      }
    },
    [userId, addScholarshipToFavoriteMutation]
  );

  const removeScholarshipFromFavorite = useCallback(
    async (scholarshipId: string) => {
      if (!userId || !scholarshipId) return;
      try {
        await removeScholarshipFromFavoriteMutation(scholarshipId).unwrap();
      } catch (error) {
        console.error('Failed to remove scholarship from favorites:', error);
      }
    },
    [userId, removeScholarshipFromFavoriteMutation]
  );

  const isFavoriteProcessing = isAddingToFavorite || isRemovingFromFavorite;

  return (
    <Box sx={styles.container(isFavoriteProcessing)}>
      {typeof scholarshipUrl === 'string' &&
        scholarshipUrl.trim().length > 0 && (
          <Box sx={styles.card(outlined)}>
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }}>
              <Box sx={styles.scholarshipImageContainer}>
                <Image
                  src={
                    isDomainAllowed(scholarshipImage)
                      ? scholarshipImage
                      : '/assets/png/scholarship_placeholder.png'
                  }
                  alt="scholarship_Image_web"
                  width={164}
                  height={164}
                  style={
                    {
                      ...styles.programImage,
                      maxHeight: '180px'
                    } as React.CSSProperties
                  }
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </Box>
              <Box sx={styles.cardInfo}>
                <Box sx={styles.cardDetails}>
                  <Box>
                    <Box sx={styles.headerContainer}>
                      <Box sx={styles.responsiveImageContainer}></Box>
                      <Box sx={styles.titleContainer}>
                        <CustomTypography
                          fontSize={24}
                          smallFont={18}
                          fontWeight="600"
                          sx={{
                            maxLines: 2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {programTitle ?? scholarship?.scholarship_name ?? ''}
                        </CustomTypography>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 1.5
                          }}
                        >
                          <Link
                            href={scholarshipUrl}
                            prefetch={true}
                            style={styles.link}
                          >
                            <Button
                              sx={styles.applyNowButton}
                              variant="contained"
                            >
                              View
                            </Button>
                          </Link>
                          {isLoggedIn ? (
                            <FavoriteButton
                              scholarshipId={scholarshipId}
                              isFavorite={isFavorite}
                              addScholarshipToFavorite={
                                addScholarshipToFavorite
                              }
                              isAddingToFavorite={isAddingToFavorite}
                              removeScholarshipFromFavorite={
                                removeScholarshipFromFavorite
                              }
                              isRemovingFromFavorite={isRemovingFromFavorite}
                            />
                          ) : null}
                        </Box>
                      </Box>
                    </Box>
                    {/* <Box
                      mt={1}
                      mb={2}
                      gap={1}
                      display="flex"
                      flexDirection="row"
                    >
                      {scholarshipType && (
                        <Chip
                          sx={{
                            backgroundColor: COLORS.bgBlue,
                            color: COLORS.primary
                          }}
                          label={scholarshipType}
                        />
                      )}
                    </Box> */}
                    {/* <Box
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                        gap={1}
                      >
                        <Image
                          src={'/assets/svg/star.svg'}
                          alt="star_logo"
                          width={24}
                          height={24}
                        />
                        <Typography>4</Typography>
                      </Box> */}
                    {offeredBy && (
                      <Typography mt={1} variant="body1">
                        {`Offered by ${[offeredBy, universityAddress].filter(Boolean).join(', ')}`}
                      </Typography>
                    )}
                  </Box>
                  <Box gap={1} sx={styles.programDetails}>
                    <Box sx={styles.detailRow}>
                      <Image
                        src={`/assets/svg/${hasPassed ? 'calendar' : 'calendar-primary'}.svg`}
                        alt="calendar"
                        width={32}
                        height={32}
                        priority
                      />
                      <Box>
                        <Typography
                          color={hasPassed ? 'error' : 'primary.main'}
                        >
                          Deadline
                        </Typography>
                        <Typography
                          textAlign="center"
                          fontWeight="600"
                          color={hasPassed ? 'error' : 'primary.main'}
                        >
                          {formattedDate}
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
                        src="/assets/svg/fee-icon.svg"
                        alt="fee icon"
                        width={32}
                        height={32}
                        priority
                      />
                      <Box>
                        <Typography>Amount</Typography>
                        <Typography fontWeight="600">
                          {formatMoney(scholarship?.amount) ||
                            formatMoney(scholarshipAmount)}
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
                        src="/assets/svg/teacher.svg"
                        alt="teacher"
                        width={32}
                        height={32}
                        priority
                      />
                      <Box>
                        <Typography>{'Scholarship Type'}</Typography>
                        <Typography fontWeight="600">
                          {scholarshipType ?? '_'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Link
                    href={scholarshipUrl}
                    prefetch={true}
                    style={styles.link}
                  >
                    <Button
                      sx={{ mt: 2, display: { xs: 'block', md: 'none' } }}
                      fullWidth
                      variant="contained"
                    >
                      View
                    </Button>
                  </Link>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
    </Box>
  );
};

ScholarshipCard.displayName = 'ScholarshipCard';

export default ScholarshipCard;
