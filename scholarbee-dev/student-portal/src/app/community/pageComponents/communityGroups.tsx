import { Stack } from '@mui/material';
import CommunityGroupCard from './communityGroupCard';

const CommunityGroups = () => {
  return (
    <Stack mt={4} spacing={1}>
      <CommunityGroupCard />
      <CommunityGroupCard title="University of Lahore" />
      <CommunityGroupCard title="University of Agriculture Faisalabad" />
    </Stack>
  );
};

export default CommunityGroups;
