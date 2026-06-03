/* eslint-disable @typescript-eslint/no-explicit-any */
import WithHeroSection from '@/components/atoms/withHeroSection';
import { Divider, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import React from 'react';
// import { UNIVERSITY_DETAILS } from '../constants';
import InfoItem from './infoItem';
import {
  formatAdmissionDeadline,
  isDomainAllowed
} from '@/utils/helperFunctions';

const HeroSection = ({ campusData }: { campusData: any }) => {
  const UNIVERSITY_DETAILS = [
    {
      id: 1,
      label: campusData?.city,
      value: campusData?.country,
      logo: '/assets/svg/location-white.svg'
    },
    {
      id: 2,
      label: 'Established In',
      value:
        formatAdmissionDeadline(campusData?.establishedIn).formattedDate || '',
      logo: '/assets/svg/clock.svg'
    },
    {
      id: 3,
      label: 'Accreditation',
      value: campusData?.accreditation || '',

      logo: '/assets/svg/medal.svg',
      longText: campusData?.accreditation?.length > 20
    },
    {
      id: 4,
      label: 'Ranking',
      value: campusData?.ranking,
      logo: '/assets/svg/ranking.svg'
    },
    {
      id: 5,
      label: 'Total Campuses',
      value: campusData?.campusesCount,
      logo: '/assets/svg/buildings-white.svg'
    }
  ];
  return (
    <WithHeroSection backgroundImage={campusData?.primaryPicture || ''}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        alignItems="center"
        sx={styles.heroContent}
      >
        <Image
          src={
            isDomainAllowed(campusData?.universityLogo || '')
              ? campusData?.universityLogo
              : ''
          }
          alt="University Logo"
          width={100}
          height={100}
        />
        <Stack spacing={1} sx={styles.universityInfo}>
          <Typography variant={'h3'} fontWeight={600} color="white">
            {campusData?.universityName}
          </Typography>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={styles.verifiedByContainer}
          >
            {/* <Typography variant="h6" color="white">
              Verified By
            </Typography>
            <Image
              src="/assets/svg/logo-white.svg"
              alt="un-Logo"
              width={140}
              height={28}
            /> */}
          </Stack>
        </Stack>
      </Stack>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent={{ xs: 'center', sm: 'space-between' }}
        spacing={{ xs: 3, sm: 2 }}
        sx={styles.detailsContainer}
      >
        {UNIVERSITY_DETAILS.map((item, index) => (
          <React.Fragment key={item.id}>
            <InfoItem
              label={item?.label || ''}
              value={item?.value || ''}
              logo={item?.logo || ''}
              isLongText={item?.longText}
            />
            {index < UNIVERSITY_DETAILS.length - 1 && (
              <Divider orientation={'vertical'} flexItem sx={styles.divider} />
            )}
          </React.Fragment>
        ))}
      </Stack>
    </WithHeroSection>
  );
};

export default HeroSection;

const styles = {
  heroContent: {
    pt: 8
  },
  universityInfo: {
    textAlign: { xs: 'center', md: 'left' }
  },
  verifiedByContainer: {
    justifyContent: { xs: 'center', md: 'flex-start' }
  },
  detailsContainer: {
    mt: 7,
    pb: 8,
    flexWrap: 'wrap'
  },
  divider: {
    mx: { xs: 0, sm: 1 },
    my: { xs: 1, sm: 0 },
    borderColor: 'white',
    borderWidth: '1px'
  }
};
