import { Box, Typography } from '@mui/material';
import React, { useState } from 'react';
import Image from 'next/image';
import playIcon from '@public/assets/svg/play-icon.svg';
import { VideoCardTypes } from '../create-profile/constants/types';
import VideoModal from '@/components/organisms/videoModel';

const VideoCardSection = ({
  name,
  imageUrl,
  title,
  description,
  videoUrl,
  left,
  top
}: VideoCardTypes & { videoUrl: string; left?: number; top?: number }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenVideo = () => {
    setIsModalOpen(true);
  };

  const handleCloseVideo = () => {
    setIsModalOpen(false);
  };

  const cardRootStyles = {
    position: left !== undefined || top !== undefined ? 'absolute' : 'relative',
    width: { xs: '100%', md: 384 },
    height: { xs: '100%', md: 466 },
    left: left,
    top: top,
    background: 'linear-gradient(0deg, #F4F7FF, #F4F7FF), #004ae0',
    borderRadius: '12px',
    overflow: 'hidden'
  } as const;

  return (
    <Box sx={cardRootStyles}>
      {/* Video frame */}
      <Box
        onClick={handleOpenVideo}
        sx={{
          position: 'absolute',
          width: { xs: 293, md: 352 },
          height: { xs: 183, md: 220 },
          left: { xs: 13, md: 16 },
          top: { xs: 13, md: 16 },
          background: '#222222',
          borderRadius: '6px',
          overflow: 'hidden',
          cursor: 'pointer'
        }}
      >
        {/* Positioned image per Figma */}
        <Box sx={{ position: 'absolute', inset: 0 }}>
          <Image
            src={imageUrl}
            alt={title}
            width={376}
            height={315}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            priority
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.2)'
            }}
          />
        </Box>
        {/* Play icon centered */}
        <Box
          className="play-icon"
          sx={{
            position: 'absolute',
            width: { xs: 37, md: 44.36 },
            height: { xs: 37, md: 44 },
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.8
          }}
        >
          <Image
            src={playIcon}
            alt="Play"
            width={44}
            height={44}
            style={{ width: '100%', height: '100%' }}
          />
        </Box>
      </Box>

      {/* Text block */}
      <Box
        sx={{
          position: 'absolute',
          width: { xs: 285, md: 342 },
          height: { xs: 100, md: 124 },
          left: { xs: 13, md: 16 },
          top: { xs: 230, md: 276 }
        }}
      >
        <Typography
          sx={{
            width: '100%',
            height: { xs: 20, md: 24 },

            fontWeight: 600,
            fontSize: { xs: 18, md: 20 },
            lineHeight: { xs: '22px', md: '24px' },
            textAlign: 'center'
          }}
        >
          {name}
        </Typography>
        <Typography
          sx={{
            width: '100%',
            height: { xs: 70, md: 84 },

            fontWeight: 400,
            fontSize: { xs: 14, md: 16 },
            lineHeight: { xs: '24px', md: '28px' },
            textAlign: 'center',
            color: 'rgba(0, 0, 0, 0.8)',
            mt: 2
          }}
        >
          {description}
        </Typography>
      </Box>

      <VideoModal
        open={isModalOpen}
        onClose={handleCloseVideo}
        videoUrl={videoUrl}
      />
    </Box>
  );
};

export default VideoCardSection;
