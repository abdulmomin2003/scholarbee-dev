import React from 'react';
import { CustomTypography } from '../atoms/customTypography';
import { Typography } from '@mui/material';

const AuthTitleAndSubheading = ({
  title,
  subHeading
}: {
  title: string;
  subHeading: string;
}) => {
  return (
    <>
      <CustomTypography
        component="h1"
        variant="h4"
        fontSize={32}
        smallFont={18}
        fontWeight={500}
        data-test-id="auth-title"
      >
        {title}
      </CustomTypography>
      <Typography
        variant="body1"
        color="primary"
        data-test-id="auth-subheading"
        mt={1}
      >
        {subHeading}
      </Typography>
    </>
  );
};

export default AuthTitleAndSubheading;
