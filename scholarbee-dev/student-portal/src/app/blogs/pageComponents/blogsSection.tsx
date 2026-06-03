import Tag from '@/components/atoms/tag';
import { Box, Container, Grid } from '@mui/material';
import React from 'react';
import wifiIcon from '@public/assets/svg/wifi.svg';
import { CustomTypography } from '@/components/atoms/customTypography';
import Categories from './categories';
import BlogCard from '@/components/molecules/blogCard';
// import PaginationButtons from './paginationButtons';

// const fetchBlogs = async () => {
// const res = await fetch(
//   'http://api-dev.scholarbee.pk/api/blog-posts?page=1&limit=10&sortBy=published_at&sortOrder=desc',
//   {
//     cache: 'no-store'
//   }
// );

// if (!res.ok) {
//   throw new Error('Failed to fetch blogs');
// }

// const data = await res.json();
// return data || [];
// };

const Blogs = () => {
  // const blogs = await fetchBlogs();
  return (
    <Box>
      <Container>
        <Tag title="Our Blogs" icon={wifiIcon} />
        <CustomTypography
          variant="h3"
          fontWeight={700}
          fontSize={32}
          smallFont={24}
          smallWeight={600}
          sx={{ mt: 2 }}
        >
          Recent News
        </CustomTypography>
        <Categories />

        <Grid container mt={5} spacing={2}>
          {/* {blogs.posts.map(
            (blog: { _id: string; title: string; published_at: string }) => ( */}
          <Grid
            // key={blog?._id}
            sx={{ margin: '0 auto' }}
            size={{ xs: 12, sm: 6, md: 4 }}
          >
            <BlogCard
              title={
                'ScholarBee Secures $350,000 Pre-Seed Funding to Transform Higher Education Access'
              }
              subTitle={
                'ScholarBee, a rising force in the EdTech world, is on a mission to revolutionize the way students access scholarships and higher education.'
              }
              publishedAt={'March 21, 2025'}
            />
          </Grid>
          {/* )
          )} */}
        </Grid>
        {/* <PaginationButtons /> */}
      </Container>
    </Box>
  );
};

export default Blogs;
