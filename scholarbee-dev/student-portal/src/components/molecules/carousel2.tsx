import React from 'react';
import SliderBase from 'react-slick';
import { Box, useMediaQuery, useTheme } from '@mui/material';

// Type assertion to fix TypeScript compatibility issue with react-slick
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Slider = SliderBase as any;
import Image from 'next/image';
import SliderImage1 from '../../../public/assets/png/scholarship1.jpg';
import SliderImage2 from '../../../public/assets/png/scholarship2.jpg';
import SliderImage3 from '../../../public/assets/png/scholarship3.jpg';
import nextArrowImage from '@public/assets/svg/arrow-right.svg';
import prevArrowImage from '@public/assets/svg/arrow-left.svg';

const slideItems = [SliderImage1, SliderImage2, SliderImage3];

const Carousel = () => {
  const theme = useTheme();
  const isMdOrLarger = useMediaQuery(theme.breakpoints.up('md'), {
    noSsr: true
  });

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />
  };

  function SampleNextArrow(props: { onClick?: () => void }) {
    const { onClick } = props;
    return (
      <Box
        sx={{
          cursor: 'pointer',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          display: 'block',
          position: 'absolute',
          right: isMdOrLarger ? '10px' : '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          padding: '16px 16px 8px 16px',

          borderRadius: '50%'
        }}
        onClick={onClick}
        data-test-id="next-arrow"
      >
        <Image src={nextArrowImage} alt="Next" width={24} height={24} />
      </Box>
    );
  }

  function SamplePrevArrow(props: { onClick?: () => void }) {
    const { onClick } = props;
    return (
      <div
        style={{
          cursor: 'pointer',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          display: 'block',
          position: 'absolute',
          left: isMdOrLarger ? '10px' : '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          padding: '16px 16px 8px 16px',
          borderRadius: '50%',
          zIndex: 1
        }}
        onClick={onClick}
        data-test-id="prev-arrow"
      >
        <Image src={prevArrowImage} alt="Previous" width={24} height={24} />
      </div>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '1200px',
        mx: 'auto',
        borderRadius: 2
      }}
      data-test-id="carousel-container"
    >
      <Slider {...settings}>
        {slideItems.map((src, index) => (
          <Box
            borderRadius={2}
            key={index}
            data-test-id={`slide-item-${index}`}
          >
            <Image
              src={src}
              alt="Example"
              width={800}
              height={341}
              style={{
                borderRadius: '16px',
                width: '100%',
                height: '341px',
                objectFit: 'cover'
              }}
              priority
              sizes="(max-width: 768px) 100vw, 
         (max-width: 1200px) 50vw, 
         800px"
            />
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default Carousel;
