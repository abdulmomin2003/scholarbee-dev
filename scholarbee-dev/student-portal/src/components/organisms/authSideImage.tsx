'use client';
import { Box, Container, Grid, Typography } from '@mui/material';
import Image from 'next/image';
import React from 'react';
import circleBg from '@public/assets/svg/circles-bg.svg';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import { CustomTypography } from '../atoms/customTypography';
import ArrowLeft from '@public/assets/svg/arrow-left-white.svg';
import { useRouter } from 'next/navigation';

const AuthSideImage = ({
  text,
  sideImage,
  imageHeight,
  imageWidth,
  showBackButton
}: {
  text: string;
  sideImage: StaticImport;
  imageHeight?: number;
  imageWidth?: number;
  showBackButton?: boolean;
}) => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };
  return (
    <Grid
      size={{
        xs: 12,
        md: 6
      }}
      sx={{
        background: 'linear-gradient(174deg, #4A9DE0 2.64%, #0B3B95 92.87%)',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 4,
        position: 'relative',
        overflowY: { sm: 'auto', md: 'hidden' }
      }}
      data-test-id="auth-side-image"
    >
      <Image
        src={circleBg}
        alt="circle bg image"
        style={{
          zIndex: 0,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
        data-test-id="background-image"
      />
      <Container sx={{ zIndex: 10 }}>
        {showBackButton && (
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-start'
            }}
          >
            <CustomTypography
              onClick={handleBack}
              sx={{
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'white',
                textAlign: 'start'
              }}
            >
              <Image src={ArrowLeft} alt="Back" width={24} height={24} />
              {' Back'}
            </CustomTypography>
          </Box>
        )}
      </Container>

      <Box
        textAlign="center"
        sx={{
          maxWidth: {
            sm: '500px',
            md: '600px'
          },
          // px: { xs: 4, md: 9 },
          // py: { xs: 4, md: 10 },
          borderRadius: '24px',
          // border: '1px solid #fff',
          // background: 'rgba(63, 93, 150, 0.10)',
          zIndex: 2
        }}
        data-test-id="content-box"
      >
        <Image
          src={sideImage}
          alt="Illustration"
          width={imageWidth || 425}
          height={imageHeight || 425}
          style={{
            width: '100%',
            maxWidth: imageWidth || '425px',
            height: 'auto'
          }}
          priority
          data-test-id="side-image"
        />
        <Typography variant="h5" color="white" mt={2} data-test-id="text">
          {text}
        </Typography>
      </Box>
      <Box />
    </Grid>
  );
};

export default AuthSideImage;
