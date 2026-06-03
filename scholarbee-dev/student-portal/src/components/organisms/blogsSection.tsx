import React from 'react';
import { Box, Container, Grid } from '@mui/material';
import wifiIcon from '@public/assets/svg/wifi.svg';
import Tag from '@/components/atoms/tag';
import Title from '@/components/atoms/title';
import BlogCard from '../molecules/blogCard';

const BlogsSection = () => {
  return (
    <Box sx={styles.root} data-test-id="blogs-section-root">
      <Container sx={styles.container} data-test-id="blogs-section-container">
        <Tag
          icon={wifiIcon}
          title="Our Blogs"
          data-test-id="blogs-section-tag"
        />
        <Title title="Recent News" data-test-id="blogs-section-title" />
        <Grid container spacing={2} data-test-id="blogs-section-grid">
          <Grid
            sx={{ margin: '0 auto' }}
            size={{ xs: 12, sm: 6, md: 4 }}
            data-test-id="blogs-section-grid-item"
          >
            <BlogCard data-test-id="blogs-section-blog-card" />
          </Grid>
          <Grid
            sx={{ margin: '0 auto' }}
            size={{ xs: 12, sm: 6, md: 4 }}
            data-test-id="blogs-section-grid-item"
          >
            <BlogCard data-test-id="blogs-section-blog-card" />
          </Grid>
          <Grid
            sx={{ margin: '0 auto' }}
            size={{ xs: 12, sm: 6, md: 4 }}
            data-test-id="blogs-section-grid-item"
          >
            <BlogCard data-test-id="blogs-section-blog-card" />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default BlogsSection;

const styles = {
  root: {
    bgcolor: 'white',
    display: 'flex',
    justifyContent: 'center',
    pt: {
      xs: 2,
      md: 5
    }
  },
  container: {
    p: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    mt: {
      xs: 3,
      md: 6,
      lg: 10
    }
  }
};
