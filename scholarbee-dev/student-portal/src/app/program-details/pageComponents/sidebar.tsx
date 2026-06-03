'use client';
import { Box, Typography, useMediaQuery } from '@mui/material';
import Image from 'next/image';
import React from 'react';
import universityIcon from '@public/assets/svg/about-university.svg';
import overviewIcon from '@public/assets/svg/program-overview.svg';
import detailsIcon from '@public/assets/svg/program-overview.svg';
import requirementsIcon from '@public/assets/svg/program-overview.svg';
import feeIcon from '@public/assets/svg/program-overview.svg';
import scholarshipIcon from '@public/assets/svg/program-overview.svg';

const sidebarItems = [
  { icon: universityIcon, label: 'About University', selected: true },
  { icon: overviewIcon, label: 'Program Overview' },
  { icon: detailsIcon, label: 'Program Details' },
  { icon: requirementsIcon, label: 'Admission Requirements' },
  { icon: feeIcon, label: 'Fee Structure' },
  { icon: scholarshipIcon, label: 'Scholarships' }
];

const Sidebar = () => {
  const isMobile = useMediaQuery('(max-width:600px)');

  return (
    <Box
      sx={isMobile ? sidebarStyles.mobileContainer : sidebarStyles.container}
    >
      {sidebarItems.map((item, index) => (
        <Box
          key={index}
          sx={{
            ...sidebarStyles.item,
            ...(item.selected && sidebarStyles.selectedItem)
          }}
        >
          <Image
            src={item.icon}
            alt={`${item.label} icon`}
            width={24}
            height={24}
          />
          <Typography variant="body1" fontSize={14} fontWeight={600}>
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default Sidebar;

const sidebarStyles = {
  container: {
    p: 2,
    backgroundColor: 'white',
    borderRadius: 2
  },
  mobileContainer: {
    display: 'flex',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    p: 2,
    backgroundColor: 'white',
    borderRadius: 2,
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': {
      display: 'none'
    }
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    py: 2,
    px: 2,
    borderRadius: 2,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f0f0f0'
    },
    marginTop: 1,
    flexShrink: 0
  },
  selectedItem: {
    backgroundColor: '#004ae0',
    color: 'white',
    '&:hover': {
      backgroundColor: '#004ae0'
    }
  }
};
