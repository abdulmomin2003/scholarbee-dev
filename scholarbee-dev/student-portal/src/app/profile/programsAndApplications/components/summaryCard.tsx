import { Typography, Stack, Grid, Box } from '@mui/material';
import { COLORS } from '@/constants/colors';
import React from 'react';

const ProfileSummaryCard = ({
  title,
  count,
  // actionText,
  icon,
  iconBgColor
  // onClick
}: {
  title: string;
  count?: number;
  // actionText?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  // onClick?: () => void;
}) => {
  let displayCount: string | number = '08';
  if (typeof count === 'number') {
    if (count > 0 && count < 10) {
      displayCount = `0${count}`;
    } else {
      displayCount = count;
    }
  }
  return (
    <Grid
      sx={{
        border: `1px solid ${COLORS.borderColor}`,
        px: 2,
        pt: 2,
        pb: 1,
        borderRadius: 3
      }}
      size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
    >
      <Box
        sx={{
          height: 36,
          width: 36,
          bgcolor: iconBgColor,
          mb: 3,
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {icon}
      </Box>
      <Stack
        direction={'row'}
        justifyContent={'space-between'}
        alignItems={'center'}
      >
        <Stack>
          <Typography fontSize={14}>{title}</Typography>
          <Typography fontSize={28} fontWeight={500}>
            {displayCount}
          </Typography>
        </Stack>
        {/* <Typography
          sx={{
            cursor: 'pointer',
            textDecoration: 'underline',
            whiteSpace: 'nowrap'
          }}
          fontSize={14}
          fontWeight={500}
          color="primary"
          onClick={onClick}
        >
          {actionText ?? 'See All'}
        </Typography> */}
      </Stack>
    </Grid>
  );
};

export default ProfileSummaryCard;
