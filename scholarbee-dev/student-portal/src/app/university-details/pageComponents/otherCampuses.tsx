/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import WithPaper from '@/components/atoms/withPaper';
import React, { useState } from 'react';
import { CampusInfo } from './campusInformation';
import Slider from 'react-slick';
import { Paper, Typography } from '@mui/material';
import Image from 'next/image';
import nextArrowImage from '@public/assets/svg/arrow-right-primary2.svg';
import prevArrowImage from '@public/assets/svg/arrow-left-primary.svg';

const OtherCampuses = ({ otherCampuses }: { otherCampuses: any }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = otherCampuses?.length || 0;
  function SampleNextArrow(props: { onClick?: () => void }) {
    const { onClick } = props;
    const isDisabled = currentSlide >= totalSlides - 1;

    return (
      <Paper
        elevation={6}
        sx={{
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          display: 'block',
          position: 'absolute',
          right: '-20px',
          top: '50%',
          transform: 'translateY(-50%)',
          padding: '16px 16px 8px 16px',
          borderRadius: '50%',
          zIndex: 1,
          opacity: isDisabled ? 0.3 : 1,
          pointerEvents: isDisabled ? 'none' : 'auto'
        }}
        onClick={isDisabled ? undefined : onClick}
        data-test-id="next-arrow"
      >
        <Image src={nextArrowImage} alt="Next" width={16} height={16} />
      </Paper>
    );
  }

  function SamplePrevArrow(props: { onClick?: () => void }) {
    const { onClick } = props;
    const isDisabled = currentSlide <= 0;

    return (
      <Paper
        elevation={6}
        sx={{
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          display: 'block',
          position: 'absolute',
          left: '-20px',
          top: '50%',
          transform: 'translateY(-50%)',
          padding: '16px 16px 8px 16px',
          borderRadius: '50%',
          zIndex: 1,
          opacity: isDisabled ? 0.3 : 1,
          pointerEvents: isDisabled ? 'none' : 'auto'
        }}
        onClick={isDisabled ? undefined : onClick}
        data-test-id="prev-arrow"
      >
        <Image src={prevArrowImage} alt="Previous" width={16} height={16} />
      </Paper>
    );
  }

  const sliderSettings = {
    infinite: false,
    speed: 500,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    beforeChange: (current: number, next: number) => {
      setCurrentSlide(next);
    }
  };

  return (
    <WithPaper title="Other Campuses">
      {otherCampuses.length > 0 ? (
        <Slider {...sliderSettings}>
          {otherCampuses.map((campus: any) => {
            const campusInformation = {
              faculty: campus?.faculty || '_',
              area: campus?.area || '_',
              housingAvailable: campus?.housing_available ? 'Yes' : 'No',
              website: campus?.website || '_',
              city: campus?.address?.city || '_',
              country: campus?.address?.country || '_',
              slug: campus?.slug || '_'
            };
            return (
              <div key={campus?.id} style={{ padding: '0 8px' }}>
                <CampusInfo
                  campusInformation={campusInformation}
                  primaryPicture={campus?.primary_picture || ''}
                  campusId={campus?.id}
                />
              </div>
            );
          })}
        </Slider>
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          py={2}
        >
          No other campuses found
        </Typography>
      )}
    </WithPaper>
  );
};

export default OtherCampuses;
