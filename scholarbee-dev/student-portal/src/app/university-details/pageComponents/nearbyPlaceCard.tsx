import { COLORS } from '@/constants/colors';
import { Box, Button, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import React, { useState } from 'react';
import SendIcon from '@mui/icons-material/Send';

const NearByPlaceCard = ({
  title,
  image,
  placeInfo,
  destinationLat,
  destinationLng
}: {
  title: string;
  image: string;
  placeInfo: { id: number; title: string; image: string }[];
  destinationLat?: number;
  destinationLng?: number;
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(image);

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      // Use placeholder image based on the original image type
      if (image.includes('hostal')) {
        setImageSrc('/assets/png/hostal.png');
      } else if (image.includes('restaurant')) {
        setImageSrc('/assets/png/restaurant.png');
      } else {
        setImageSrc('/assets/png/Placeholderimage.png');
      }
    }
  };

  const handleGetDirection = () => {
    if (destinationLat && destinationLng) {
      // Open Google Maps with directions - user will be prompted for their current location
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destinationLat},${destinationLng}`;
      window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      sx={{
        border: `1px solid ${COLORS.borderColor}`,
        p: 1.5,
        borderRadius: 3
      }}
      spacing={2}
    >
      <Box
        sx={{
          width: { xs: '100%', sm: '154px' },
          height: { xs: '200px', sm: '122px' },
          position: 'relative',
          borderRadius: '8px',
          overflow: 'hidden',
          flexShrink: 0
        }}
      >
        <Image
          src={imageSrc}
          alt={title}
          fill
          onError={handleImageError}
          style={{ objectFit: 'cover' }}
        />
      </Box>
      <Stack justifyContent={'space-between'} sx={{ flex: 1 }}>
        <Typography fontWeight={500}>{title}</Typography>
        <Stack direction="row" alignItems="center" spacing={2}>
          {placeInfo.map((item) => (
            <InfoItem key={item.id} icon={item.image} value={item.title} />
          ))}
        </Stack>
        <Button
          variant="contained"
          sx={{
            px: 1.25,
            py: 1,
            mt: { xs: 2, sm: 0 },
            alignSelf: 'flex-start'
          }}
          endIcon={<SendIcon />}
          onClick={handleGetDirection}
          disabled={!destinationLat || !destinationLng}
        >
          Get Direction
        </Button>
      </Stack>
    </Stack>
  );
};

const InfoItem = ({ icon, value }: { icon: string; value: string }) => {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <Image src={icon} alt="icon" width={18} height={18} />
      <Typography variant="body2" fontSize={14}>
        {value}
      </Typography>
    </Stack>
  );
};

export default NearByPlaceCard;
