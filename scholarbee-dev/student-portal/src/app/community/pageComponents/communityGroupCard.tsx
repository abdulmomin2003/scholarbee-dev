'use client';
import Image from 'next/image';
import UniversityImage from '@public/assets/png/program1.png';
import PeopleGrayIcon from '@public/assets/svg/people-gray.svg';
import { Button, Stack, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { COLORS } from '@/constants/colors';

interface CommunityGroupCardProps {
  title?: string;
  createdAt?: string;
  imageUrl?: string;
  groupMembers?: string;
}

const CommunityGroupCard = ({
  title,
  createdAt,
  imageUrl,
  groupMembers
}: CommunityGroupCardProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{
        border: `1px solid ${COLORS.borderColor}`,
        p: 1,
        borderRadius: 4
      }}
    >
      <Image
        src={imageUrl || UniversityImage}
        alt="university_image"
        width={isMobile ? 330 : 192}
        height={isMobile ? 145 : 192}
        quality={100}
        sizes={isMobile ? '100vw' : '192px'}
        style={{
          borderRadius: '12px',
          objectFit: 'cover',
          width: '100%',
          maxWidth: isMobile ? '100%' : '96px',
          maxHeight: isMobile ? '145px' : '100%',
          minHeight: isMobile ? '145px' : '96px',
          height: 'auto'
        }}
      />

      <Stack sx={{ flexGrow: 1 }} spacing={1}>
        <Typography variant="h6">
          {title || 'National University of Science & Technology'}
        </Typography>
        <Typography
          fontSize={14}
          variant="body2"
        >{`Created: ${createdAt || '24 Dec 2024'}`}</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Image
            src={PeopleGrayIcon}
            height={20}
            width={20}
            alt="people_icon"
          />
          <Typography fontSize={14} variant="body2">
            {groupMembers || '3.1k'}
          </Typography>
        </Stack>
      </Stack>
      <Button
        variant="contained"
        sx={{ alignSelf: 'center', whiteSpace: 'nowrap', px: 6 }}
      >
        Join Group
      </Button>
    </Stack>
  );
};

export default CommunityGroupCard;
