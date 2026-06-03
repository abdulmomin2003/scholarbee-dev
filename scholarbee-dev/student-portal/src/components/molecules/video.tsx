import React from 'react';
import { Box } from '@mui/material';

const VideoBackground = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
          //   background: 'rgba(0, 0, 0, 0.4)'
          //   zIndex: 1
        }
      }}
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <source src="/assets/videos/cover-video.mp4" type="video/mp4" />
      </video>
    </Box>
  );
};

export default VideoBackground;
