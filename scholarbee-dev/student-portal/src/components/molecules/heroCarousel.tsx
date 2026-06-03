'use client';
import { Box } from '@mui/material';
import React from 'react';
// import Slider, { Settings } from 'react-slick';
// import Image from 'next/image';
// import { carouselImages } from '@/constants';
// import { COLORS } from '@/constants/colors';
// import { toBase64 } from '@/utils/imageUtils';
import VideoBackground from './video';

const styles = {
  carouselContainer: {
    position: 'absolute',
    width: '100%',
    height: '575px'
    // backgroundColor: COLORS.bgColor
  },
  contentStyle: {
    height: '575px',
    position: 'relative',
    overflow: 'hidden'
  }
};

// const shimmer = `
// <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
//   <rect width="100" height="100" fill="#f5f5f5"/>
// </svg>
// `;

export default function Carousel() {
  // const settings: Settings = {
  //   infinite: true,
  //   speed: 700,
  //   slidesToShow: 1,
  //   slidesToScroll: 1,
  //   autoplay: true,
  //   autoplaySpeed: 5000,
  //   fade: true,
  //   pauseOnHover: false,
  //   lazyLoad: 'ondemand'
  // };

  return (
    <Box sx={styles.carouselContainer}>
      <VideoBackground />

      {/* <Slider {...settings} data-test-id="carousel-container">
        {carouselImages.map((image: string, index: number) => (
          <Box key={index} data-test-id={`slide-item-${index}`}>
            <Box sx={styles.contentStyle}>
              <Image
                src={image}
                alt={`Carousel slide ${index + 1}`}
                fill
                role="presentation"
                aria-hidden="true"
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
                priority={index === 0}
                quality={75}
                placeholder="blur"
                blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer)}`}
                sizes="100vw"
              />
            </Box>
          </Box>
        ))}
      </Slider> */}
    </Box>
  );
}
