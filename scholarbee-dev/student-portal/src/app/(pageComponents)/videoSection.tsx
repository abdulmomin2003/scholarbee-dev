import React from 'react';
import VideoCardSection from './viewCardSection';
import { Grid } from '@mui/material';
import { VIDEO_DATA } from '@/constants';
import { VideoCardTypes } from '../create-profile/constants/types';

const VideoSection = () => {
  return (
    <Grid sx={{ mt: { xs: 5, md: 7 } }} container spacing={4}>
      {VIDEO_DATA.map((item) => (
        <Grid
          key={item.name}
          sx={{ margin: '0 auto' }}
          size={{ xs: 12, sm: 6, md: 4 }}
        >
          <VideoCardSection {...(item as VideoCardTypes)} />
        </Grid>
      ))}
    </Grid>
  );
};

export default VideoSection;
