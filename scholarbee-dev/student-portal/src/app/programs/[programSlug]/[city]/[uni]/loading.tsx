import { Box } from '@mui/material';
import Navbar from '@/components/organisms/navbar';
import DetailPageSkeleton from '@/app/program-details/pageComponents/detailPageSkelton';
import { COLORS } from '@/constants/colors';

export default function ProgramDetailLoading() {
  return (
    <Box bgcolor={COLORS.bgColor}>
      <Navbar />
      <DetailPageSkeleton />
    </Box>
  );
}
