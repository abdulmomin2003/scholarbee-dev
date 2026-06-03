import { Box, Button, Container, Typography } from '@mui/material';
import Link from 'next/link';
import Navbar from '@/components/organisms/navbar';
import Footer from '@/components/organisms/footer';
import { COLORS } from '@/constants/colors';
import ProgramDetailsBackButton from './ProgramDetailsBackButton';

export default function ProgramDetailsNotFound() {
  return (
    <Box bgcolor={COLORS.bgColor}>
      <Navbar />
      <Container sx={{ py: 14, textAlign: 'center' }}>
        <Typography variant="h4" color="error" gutterBottom>
          Program Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          The program you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </Typography>
        <ProgramDetailsBackButton />
        <Link href="/programs" style={{ textDecoration: 'none' }}>
          <Button variant="outlined" component="span">
            Explore Programs
          </Button>
        </Link>
      </Container>
      <Footer />
    </Box>
  );
}
