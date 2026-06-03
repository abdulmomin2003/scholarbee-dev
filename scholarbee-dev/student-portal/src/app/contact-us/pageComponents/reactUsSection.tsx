import { Box, Container, Grid, Typography } from '@mui/material';
import React from 'react';
import contactIcon from '@public/assets/svg/call.svg';
import Tag from '@/components/atoms/tag';
import ContactUsCard from './contactUsCard';
import { CONTACT_DATA } from '@/constants';

const ReachUsSection = () => {
  return (
    <Box>
      <Container
        sx={{
          backgroundColor: '#F4F7FF',
          borderRadius: 2.5,
          py: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Tag bgWhite icon={contactIcon} title="Reach Us Out" />
        <Typography mt={2} variant="h4" fontWeight="bold">
          Get In Touch With Us Now
        </Typography>
        <Typography mt={1.5} variant="h6">
          Contact us without any hesitation
        </Typography>
        <Grid
          container
          justifyContent="center"
          spacing={3}
          sx={{ mt: { xs: 5, md: 7, lg: 10 } }}
        >
          {CONTACT_DATA.map((contact) => (
            <Grid key={contact.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <ContactUsCard focused={contact.focused} contact={contact} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default ReachUsSection;
