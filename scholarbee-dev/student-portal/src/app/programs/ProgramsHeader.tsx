import React from 'react';
import { Box, Container } from '@mui/material';
import CustomizedBreadcrumbs from '@/components/organisms/breadCrumbs';
import HeaderText from './(pageComponents)/headerText';

const ProgramsHeader = () => {
  return (
    <Box bgcolor="white">
      <Container>
        <CustomizedBreadcrumbs />
        <HeaderText />
      </Container>
    </Box>
  );
};

export default ProgramsHeader;
