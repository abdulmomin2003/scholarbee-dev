import React from 'react';
import Image from 'next/image';
import BlogImage from '@public/assets/png/blogImage.png';
import { Box, Typography } from '@mui/material';
import { shimmer, toBase64 } from '@/utils/imageUtils';

function BlogCard({
  title,
  publishedAt,
  subTitle
}: {
  title?: string;
  publishedAt?: string;
  subTitle?: string;
}) {
  return (
    <Box
      component="article"
      maxWidth="370px"
      sx={{
        ...styles.blogCard,
        position: 'relative',
        '&:hover': {
          '& img': {
            transform: 'scale(1.05)'
          },
          '& .blog-content': {
            transform: 'translateY(-4px)'
          }
        }
      }}
      data-test-id="blog-card"
    >
      {/* Image Container */}
      <Box
        sx={{
          position: 'relative',
          aspectRatio: '370/220',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: 2
        }}
      >
        <Image
          src={BlogImage}
          alt="Blog article cover image showing college applications process"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 370px"
          style={{
            objectFit: 'cover',
            borderRadius: '16px',
            transition: 'transform 0.3s ease-in-out'
          }}
          quality={80}
          placeholder="blur"
          blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(370, 220))}`}
        />
      </Box>

      <Box
        className="blog-content"
        sx={{
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        <Box
          borderRadius={1}
          px={2.5}
          py={'5px'}
          display="inline-block"
          bgcolor="#004ae0"
          data-test-id="blog-date"
          sx={{
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Typography
            variant="body1"
            fontSize={12}
            color="white"
            component="time"
            dateTime="2024-03-22"
          >
            {publishedAt}
          </Typography>
        </Box>

        <Typography
          variant="h5"
          component="h2"
          data-test-id="blog-title"
          sx={{
            mt: 2,
            mb: 1,
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            fontWeight: 600,
            lineHeight: 1.3
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          data-test-id="blog-description"
          sx={{
            color: 'text.secondary',
            lineHeight: 1.6
          }}
        >
          {subTitle}
        </Typography>
      </Box>
    </Box>
  );
}

export default BlogCard;

const styles = {
  blogCard: {
    margin: '0 auto',
    mt: {
      xs: 2,
      md: 0
    },
    cursor: 'pointer',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)'
    }
  }
};
