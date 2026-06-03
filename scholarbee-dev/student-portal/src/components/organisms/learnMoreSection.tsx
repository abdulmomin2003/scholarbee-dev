import { Box, Button, Container, Typography } from '@mui/material';
import React from 'react';

const LearnMoreSection = () => {
  return (
    <Box bgcolor="white" pt={10} px={3}>
      <Container sx={styles.container}>
        <Typography component="h2" variant="h5" fontWeight="500">
          Learn more about ScholarBee
        </Typography>
        <Button sx={styles.learnMoreButton} variant="contained">
          Learn More
        </Button>
      </Container>
    </Box>
  );
};

export default LearnMoreSection;

const styles = {
  container: {
    px: 9,
    py: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 1.5,
    flexDirection: { xs: 'column', sm: 'row' }
  },
  learnMoreButton: { mt: { xs: 2, sm: 0 } }
};
