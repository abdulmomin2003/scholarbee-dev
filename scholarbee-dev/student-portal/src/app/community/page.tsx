import Navbar from '@/components/organisms/navbar';
import {
  Box,
  Container,
  Divider,
  Grid,
  Pagination,
  Stack,
  Typography,
  TextField
} from '@mui/material';
import React from 'react';
import CustomizedBreadcrumbs from '@/components/organisms/breadCrumbs';
import PageTextHeader from '@/components/organisms/pageTextHeader';
import { COLORS } from '@/constants/colors';
import Footer from '@/components/organisms/footer';
import CommunityGroups from './pageComponents/communityGroups';
import JoinedCommunityGroupCard from './pageComponents/joinedCommunityGroupCard';
import TuneIcon from '@mui/icons-material/Tune';

const Community = () => {
  return (
    <Box>
      <Navbar />
      <Container>
        <CustomizedBreadcrumbs />
        <PageTextHeader
          heading="Community"
          subHeading="Join the community groups of your like and start discussions to ask questions about the things you are interested in."
        />
      </Container>
      <Box sx={styles.mainContainer}>
        <Container sx={styles.innerContainer}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid size={{ xs: 12, md: 8 }} sx={styles.leftGrid}>
              <SearchInput />
              <CommunityGroups />
              <Box sx={styles.paginationBox}>
                <Pagination count={10} variant="outlined" shape="rounded" />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} sx={styles.rightGrid}>
              <Typography color="primary">YOUR COMMUNITY GROUPS</Typography>
              <Stack spacing={1}>
                <JoinedCommunityGroupCard />
                <JoinedCommunityGroupCard />
                <JoinedCommunityGroupCard />
                <JoinedCommunityGroupCard />
              </Stack>
              <Divider sx={{ my: 3 }} />
              <Typography color="primary">POPULAR TOPICS</Typography>
              <Stack mt={1.5} spacing={1.5}>
                <Typography fontSize={14}>#Admission</Typography>
                <Typography fontSize={14}>#Scholarship</Typography>
                <Typography fontSize={14}>#Nust</Typography>
                <Typography fontSize={14}>#University</Typography>
                <Typography fontSize={14}>#Profile</Typography>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

const SearchInput = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: `1px solid ${COLORS.borderColor || '#E0E0E0'}`,
        borderRadius: '12px',
        padding: '2px 2px 2px 16px',
        mb: 3,
        width: '100%',
        maxWidth: '550px'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
        <Box
          component="span"
          sx={{
            display: 'flex',
            alignItems: 'center',
            mr: 1,
            color: 'grey.500'
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 21L16.65 16.65"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Box>
        <TextField
          variant="standard"
          placeholder="Search community groups"
          fullWidth
          InputProps={{
            disableUnderline: true
          }}
          sx={{
            '& .MuiInputBase-input': {
              border: 'none',
              padding: '8px 0',
              fontSize: '16px'
            }
          }}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.main',
          borderRadius: '8px',
          width: 40,
          height: 40,
          color: 'white',
          cursor: 'pointer'
        }}
      >
        <TuneIcon />
      </Box>
    </Box>
  );
};

export default Community;

const styles = {
  mainContainer: { backgroundColor: COLORS.bgColor },
  innerContainer: { py: 3 },
  leftGrid: { borderRadius: 4, backgroundColor: COLORS.white, p: 3 },
  paginationBox: { mt: 3, display: 'flex', justifyContent: 'center' },
  rightGrid: { borderRadius: 4, backgroundColor: COLORS.white, p: 3 }
};
