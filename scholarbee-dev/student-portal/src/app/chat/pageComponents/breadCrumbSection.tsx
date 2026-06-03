import BreadCrumbs from '@/components/organisms/breadCrumbs';
import { COLORS } from '@/constants/colors';
import { Box, Container } from '@mui/material';

const BreadCrumbSection = ({ customTitle }: { customTitle?: string }) => {
  return (
    <Box bgcolor={COLORS.white}>
      <Container>
        <Box>
          <BreadCrumbs sx={{ py: 2 }} customTitle={customTitle} />
        </Box>
      </Container>
    </Box>
  );
};

export default BreadCrumbSection;
