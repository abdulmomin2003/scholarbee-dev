import { Box, Container, Grid, Typography } from '@mui/material';
import Navbar from '@/components/organisms/navbar';
import Footer from '@/components/organisms/footer';
import HeroSection from './pageComponents/heroSection';
import ProgramDetailsInfo from './pageComponents/programDetailsInfo';
import DetailsAccordion from './pageComponents/detailsAccordion';
import { COLORS } from '@/constants/colors';
import { buildProgramListViewModel } from './buildProgramListViewModel';
import ProgramDetailsBreadcrumbs from './ProgramDetailsBreadcrumbs';
import ProgramDetailsAboutSection from './ProgramDetailsAboutSection';
import ProgramDetailsOverviewSection from './ProgramDetailsOverviewSection';
import { styles } from './[id]/styles';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ProgramDetailsListView({
  programDetails
}: {
  programDetails: any;
}) {
  const vm = buildProgramListViewModel(programDetails);

  return (
    <Box bgcolor={COLORS.bgColor}>
      <Navbar />
      <Box bgcolor="white">
        <ProgramDetailsBreadcrumbs {...vm.breadcrumbs} />
        <HeroSection
          uni_logo={vm.hero.uniLogo}
          campusImage={vm.hero.campusImage}
          title={vm.hero.title}
          address={vm.hero.address}
        />
      </Box>
      <Container sx={{ mb: { xs: 5, md: 10 } }}>
        <ProgramDetailsInfo infoItems={vm.infoItems} />
        <Grid mt={2} container>
          <Grid size={{ xs: 12 }}>
            <Box sx={styles.mainContainer}>
              <ProgramDetailsAboutSection items={vm.aboutUni} />
              <ProgramDetailsOverviewSection
                title={vm.programOverviewTitle}
                items={vm.programInfo}
              />
              <Box>
                <Typography
                  component="h2"
                  mt={2}
                  variant="h5"
                  mb={1}
                  fontWeight="600"
                >
                  Fee Structure
                </Typography>
                <DetailsAccordion
                  FEE_DATA={vm.feeData}
                  summary={
                    <Box sx={styles.summaryContent}>
                      <Typography
                        color={COLORS.greenPrimary}
                        fontWeight={600}
                        variant="h6"
                      >
                        {vm.feeSummaryAmount}
                      </Typography>
                      <Typography variant="body1" fontSize={14}>
                        {vm.feeSummaryLabel}
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </Box>
  );
}
