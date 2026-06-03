'use client';
import { Box, Container } from '@mui/material';
import Navbar from '@/components/organisms/navbar';
import Footer from '@/components/organisms/footer';
import { COLORS } from '@/constants/colors';
import PageHeader from './pageComponents/pageHeader';
import FilterForm from './pageComponents/filterForm';
import { useComparison } from './hooks/useComparison';
import ComparisonTable from './pageComponents/comparisonTable';

const CompareUniversities = () => {
  const comparisonProps = useComparison();

  return (
    <Box bgcolor={COLORS.bgColor}>
      <Navbar />
      <PageHeader />
      <Box sx={{ py: 4 }}>
        <Container
          maxWidth={false}
          sx={{
            maxWidth: '1440px',
            px: { xs: 2, sm: 3, md: 4 },
            pl: { lg: 0 }
          }}
        >
          <FilterForm {...comparisonProps} />
          <Box sx={{ width: '100%', overflowX: 'auto', mt: 4, pb: 2 }}>
            <ComparisonTable {...comparisonProps} />
          </Box>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default CompareUniversities;
