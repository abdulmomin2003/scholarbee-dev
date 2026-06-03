/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Box, Typography, Stack, Button } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Image from 'next/image';
import Link from 'next/link';
import { COLORS } from '@/constants/colors';
import { SxProps, Theme } from '@mui/material/styles';
import { isDomainAllowed } from '@/utils/helperFunctions';

const CampusCard = (props: any) => {
  const { name, logoUrl, campusId, address } = props;
  const chatHref = campusId ? `/chat?campusId=${campusId}` : '#';

  return (
    <Box sx={styles.cardContainer}>
      <Stack
        direction="row"
        justifyContent={'space-between'}
        alignItems={'center'}
        spacing={2}
        px={2}
        sx={{ height: '100%' }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ flexGrow: 1, overflow: 'hidden' }}
        >
          <Box sx={styles.logoContainer}>
            <Image
              src={
                logoUrl && isDomainAllowed(logoUrl)
                  ? logoUrl
                  : '/assets/png/university_placeholder.png'
              }
              alt={`${name} logo`}
              width={70}
              height={70}
              style={{ objectFit: 'cover', borderRadius: '50%' }}
            />
          </Box>

          <Stack
            direction="column"
            alignItems="flex-start"
            justifyContent="center"
            sx={{ width: '100%', overflow: 'hidden', height: '100%' }}
          >
            <Typography
              sx={{
                ...styles.campusName,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%'
              }}
            >
              {name}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <LocationOnIcon sx={styles.locationIcon} />
              <Typography variant="subtitle1">{address}</Typography>
            </Stack>
          </Stack>
        </Stack>
        <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <Link
            href={chatHref}
            style={{ textDecoration: 'none' }}
            aria-label={`Message ${name}`}
          >
            <Button
              variant="contained"
              component="span"
              sx={styles.messageButton}
            >
              Message
            </Button>
          </Link>
        </Box>
      </Stack>
    </Box>
  );
};

export default CampusCard;

const styles: Record<string, SxProps<Theme>> = {
  cardContainer: {
    width: '100%',
    borderRadius: '16px',
    overflow: 'hidden',
    // position: 'relative',
    height: '100px',
    mb: 2,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
    }
  },
  backgroundContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6))'
    }
  },
  contentContainer: {
    // position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '20px',
    justifyContent: 'space-between'
  },
  topRow: {
    mt: 1
  },
  messageButton: {
    borderRadius: '8px',
    textTransform: 'none',
    py: 1,
    px: 2,
    bgcolor: 'white',
    color: COLORS.primary,
    '&:hover': {
      bgcolor: 'rgba(255, 255, 255, 0.9)'
    }
  },
  centerContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    textAlign: 'center'
  },
  logoContainer: {
    width: '70px',
    height: '70px'
  },
  campusName: {
    fontWeight: '600',
    fontSize: '1.4rem'
  },
  locationContainer: {
    mt: 1
  },
  locationIcon: {
    // color: 'white',
    fontSize: '18px'
  }
};
