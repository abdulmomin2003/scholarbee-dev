/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import WithPaper from '@/components/atoms/withPaper';
import { COLORS } from '@/constants/colors';
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Divider,
  Button
} from '@mui/material';
import Image from 'next/image';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import CampusInfoItem from './campusInfoItem';
import ProgramsTable from './programsTable';
import Link from 'next/link';
import { isDomainAllowed } from '@/utils/helperFunctions';

/** sessionStorage key so "View Programs" stays open after visiting a program and going back */
const campusProgramsExpandedKey = (campusId: string | undefined) =>
  campusId ? `universityCampusProgramsExpanded:${campusId}` : '';

const CampusInformation = ({
  campusInformation,
  campusId,
  currentCampus = false
}: {
  campusInformation: any;
  campusId?: string;
  currentCampus?: boolean;
}) => {
  return (
    <WithPaper title="Campus Information">
      <CampusInfo
        campusInformation={campusInformation}
        campusId={campusId}
        currentCampus={currentCampus}
      />
    </WithPaper>
  );
};

export const CampusInfo = ({
  campusInformation,
  // primaryPicture,
  campusId,
  currentCampus = false
}: {
  campusInformation: any;
  primaryPicture?: string;
  campusId?: string;
  currentCampus?: boolean;
}) => {
  // const universityPath = universitySlug ?? universityId;

  const CAMPUS_INFORMATION = [
    {
      id: 1,
      label: 'Faculty',
      value: campusInformation?.faculty || '_',
      icon: '/assets/svg/people-black.svg'
    },
    {
      id: 2,
      label: 'Area',
      value: campusInformation?.area || '_',
      icon: '/assets/svg/box.svg'
    },
    {
      id: 3,
      label: 'Housing Available',
      value: campusInformation?.housingAvailable || '_',
      icon: '/assets/svg/house.svg'
    },
    {
      id: 4,
      label: 'Website',
      value: campusInformation?.website || '_',
      icon: '/assets/svg/global.svg',
      type: 'link'
    }
  ];
  const programsExpandedKey = campusProgramsExpandedKey(campusId);

  const [showTable, setShowTable] = useState(false);

  useLayoutEffect(() => {
    if (!programsExpandedKey) return;
    try {
      if (globalThis.sessionStorage.getItem(programsExpandedKey) === 'true') {
        setShowTable(true);
      }
    } catch {
      // storage unavailable
    }
  }, [programsExpandedKey]);

  const toggleProgramsTable = useCallback(() => {
    setShowTable((prev) => {
      const next = !prev;
      if (programsExpandedKey) {
        try {
          globalThis.sessionStorage.setItem(
            programsExpandedKey,
            next ? 'true' : 'false'
          );
        } catch {
          // ignore
        }
      }
      return next;
    });
  }, [programsExpandedKey]);

  const campusUrl = `/universities/${campusInformation?.city?.toLowerCase()}/${campusInformation?.slug?.toLowerCase()}`;

  return (
    <Stack sx={styles.container} spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={2.5}
        sx={{ width: '100%' }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={2.5}
          sx={{ flex: 1, minWidth: 0, width: '100%' }}
        >
          <Image
            src={
              isDomainAllowed(campusInformation?.primaryPicture || '')
                ? campusInformation?.primaryPicture
                : '/assets/png/campus-image2.png'
            }
            alt="campus-image"
            width={78}
            height={78}
            style={{ borderRadius: '8px', flexShrink: 0 }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              fontWeight="600"
              variant="h6"
              sx={{
                fontSize: { xs: '18px', sm: '20px' },
                lineHeight: 1.3
              }}
            >
              {campusInformation?.city} Campus
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                mt: 0.5
              }}
            >
              {campusInformation?.country}
            </Typography>
          </Box>
        </Stack>

        {/* Desktop-Only Message Button */}
        <Box sx={{ display: { xs: 'none', sm: 'block' }, flexShrink: 0 }}>
          <Link
            href={campusId ? `/chat?campusId=${campusId}` : '#'}
            aria-label="Message campus"
            style={{ display: 'flex' }}
          >
            <IconButton
              color="primary"
              sx={styles.messageIcon}
              component="span"
            >
              <Image
                src="/assets/svg/messages-white.svg"
                alt="Message campus"
                width={28}
                height={28}
              />
            </IconButton>
          </Link>
        </Box>
      </Stack>

      {/* Mobile-Only Message Button */}
      <Box sx={{ display: { xs: 'block', sm: 'none' }, width: '100%' }}>
        <Link
          href={campusId ? `/chat?campusId=${campusId}` : '#'}
          aria-label="Message campus"
          style={{ textDecoration: 'none' }}
        >
          <Button
            variant="contained"
            fullWidth
            startIcon={
              <Image
                src="/assets/svg/messages-white.svg"
                alt="Message campus"
                width={20}
                height={20}
              />
            }
            sx={{
              backgroundColor: COLORS.primary,
              height: '48px',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '15px',
              color: '#FFF',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: COLORS.primary,
                opacity: 0.9,
                boxShadow: 'none'
              }
            }}
          >
            Message Campus
          </Button>
        </Link>
      </Box>

      <Divider />
      <Stack
        spacing={2}
        flexWrap="wrap"
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent={{ xs: 'center', sm: 'space-between' }}
      >
        {CAMPUS_INFORMATION.map((item) => (
          <CampusInfoItem
            key={item.id}
            {...item}
            type={item.type}
            logo={item.icon}
          />
        ))}
      </Stack>

      <Divider />
      {currentCampus ? (
        <Button
          sx={{ alignSelf: 'center' }}
          variant="outlined"
          onClick={toggleProgramsTable}
        >
          {showTable ? 'Hide Programs' : 'View Programs'}
        </Button>
      ) : (
        <Link style={{ alignSelf: 'center' }} prefetch href={campusUrl}>
          <Button sx={{ alignSelf: 'center' }} variant="outlined">
            View Campus
          </Button>
        </Link>
      )}
      <Box sx={{ display: showTable ? 'block' : 'none' }}>
        {campusId ? (
          <ProgramsTable
            cityName={campusInformation?.city}
            campusId={campusId}
          />
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            py={2}
          >
            Campus ID not available
          </Typography>
        )}
      </Box>
    </Stack>
  );
};

export default CampusInformation;

const styles = {
  container: {
    border: `1px solid ${COLORS.borderColor}`,
    borderRadius: 2,
    p: { xs: 2.5, sm: 4 },
    mt: 3
  },
  messageIcon: {
    backgroundColor: `${COLORS.primary}`, // 20% opacity of primary color
    borderRadius: 2,
    height: 56,
    width: 56,
    '&:hover': {
      backgroundColor: `${COLORS.primary}` // 30% opacity on hover
    }
  }
};
