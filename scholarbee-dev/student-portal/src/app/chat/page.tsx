'use client';
import Footer from '@/components/organisms/footer';
import Navbar from '@/components/organisms/navbar';
import { Box, CircularProgress, Typography } from '@mui/material';
import React, { Suspense } from 'react';
import { COLORS } from '@/constants/colors';
import BreadCrumbSection from './pageComponents/breadCrumbSection';
import ChatSection from './pageComponents/chatSection';
import withAuth from '@/utils/withAuth';

const ChatLoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    flexDirection="column"
    p={4}
    minHeight="300px"
  >
    <CircularProgress size={40} />
    <Typography mt={2} variant="body1">
      Loading chat...
    </Typography>
  </Box>
);

const Chat = () => {
  return (
    <Box bgcolor={COLORS.bgColor}>
      <Navbar />
      <BreadCrumbSection />
      <Box>
        <Suspense fallback={<ChatLoadingFallback />}>
          <ChatSection />
        </Suspense>
      </Box>
      <Footer />
    </Box>
  );
};

export default withAuth(Chat);
