import { Box, Container, Paper, Typography } from '@mui/material';
import QuickProgramSelection from './quickProgramSelection';
import AdmissionSearchForm from './admissionSearchSection/AdmissionSearchForm';

const AdmissionSearchSection = () => {
  return (
    <Box position="relative" py={{ xs: 4, md: 5 }}>
      <Container sx={styles.container}>
        <Paper sx={styles.searchCard}>
          <Typography component="h2" variant="h6">
            Start your Admission Search
          </Typography>
          <AdmissionSearchForm />
          <QuickProgramSelection />
        </Paper>
      </Container>
    </Box>
  );
};

export default AdmissionSearchSection;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  searchCard: {
    p: 3,
    borderRadius: 3,
    boxShadow: '0px 4px 34px 0px rgba(37, 37, 37, 0.05);',
    textAlign: 'center',
    maxWidth: 1150,
    width: '100%',
    mt: { xs: 2, md: 4 }
  }
};
