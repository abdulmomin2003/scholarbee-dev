import FooterComponent from '@/components/organisms/footer';
import { Box } from '@mui/material';
import FAQSection from '../components/organisms/faqSection';
import Navbar from '../components/organisms/navbar';
import AdmissionSearchSection from './(pageComponents)/admissionSearchSection';
import CityUniversitiesCarousel from './(pageComponents)/cityUniversitiesCarousel';
import HeroSection from './(pageComponents)/heroSection/index';
import PartnerUniversitiesSection from './(pageComponents)/partnerUniversitiesSection';
import ProgramSection from './(pageComponents)/programSection';
import {
  fetchHomePrograms,
  fetchHomeScholarships
} from './(pageComponents)/programSection/serverData';
import StudyAbroadBanner from './(pageComponents)/studyAbroadBanner';
import YourJourneySection from './(pageComponents)/yourJourneySection';
import CompareUniversitiesSection from './(pageComponents)/compareUniversitiesSection';
import InstitutionalSectorSection from './(pageComponents)/institutionalSectorSection';

const Home = async () => {
  const [initialPrograms, initialScholarships] = await Promise.all([
    fetchHomePrograms(),
    fetchHomeScholarships()
  ]);

  return (
    <Box
      data-test-id="home-page"
      component="div"
      sx={{ backgroundColor: '#F4F7FF' }}
    >
      <Box component="header">
        <Navbar isCritical={false} />
      </Box>
      <Box component="main">
        <Box component="section" aria-label="Hero and stats">
          <HeroSection />
        </Box>
        <Box component="section" aria-label="Admission search">
          <AdmissionSearchSection />
        </Box>
        <Box component="section" aria-label="Universities by city">
          <CityUniversitiesCarousel />
        </Box>
        <Box component="section" aria-label="Institutional Sector">
          <InstitutionalSectorSection />
        </Box>
        <Box component="section" aria-label="Programs">
          <ProgramSection
            initialPrograms={initialPrograms}
            initialScholarships={initialScholarships}
          />
        </Box>

        <Box component="section" aria-label="Compare universities">
          <CompareUniversitiesSection />
        </Box>
        <Box component="section" aria-label="Your journey">
          <YourJourneySection />
        </Box>
        <Box component="section" aria-label="Partner universities">
          <PartnerUniversitiesSection />
        </Box>
        <Box component="section" aria-label="Frequently asked questions">
          <Box component="article" aria-label="FAQ">
            <FAQSection />
          </Box>
        </Box>
        <Box component="section" aria-label="Study abroad">
          <StudyAbroadBanner />
        </Box>
      </Box>
      <FooterComponent />
    </Box>
  );
};

export default Home;
