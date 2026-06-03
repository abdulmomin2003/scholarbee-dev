import Navbar from '@/components/organisms/navbar';
import { Box } from '@mui/material';
import type { Metadata } from 'next';
// import BlogsSection from '../components/organisms/blogsSection';
// import LearnMoreSection from '@/components/organisms/learnMoreSection';
import FAQSection from '@/components/organisms/faqSection';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://scholarbee.pk/scholarships'
  }
};
import FooterComponent from '@/components/organisms/footer';
import HeroSection from '../(pageComponents)/heroSection/index';
// import ReviewsSections from '@/components/organisms/reviewsSections';
// import { GoogleAnalytics } from '@next/third-parties/google';
import PartnersSection from '@/components/organisms/partnersSection';
import { ProgramsApi } from '@/endpoints/programs';
import FeaturedScholarshipSection from '../(pageComponents)/featuredScholarshipSection';
import ProgramSection from '../(pageComponents)/programSection';

const Home = async () => {
  // Pre-fetch programs on the server
  let initialPrograms = null;

  try {
    const programsApi = new ProgramsApi();
    initialPrograms = await programsApi.getAllPrograms(5);
  } catch (error) {
    console.error('Failed to pre-fetch programs:', error);
    // If pre-fetching fails, we'll fall back to client-side loading
  }

  return (
    <Box sx={{ backgroundColor: '#F4F7FF' }}>
      <Navbar />
      <HeroSection />
      <PartnersSection />
      <ProgramSection isScholarship initialPrograms={initialPrograms} />
      {/* <StatsSection />
      <HowScholarBeeHelps /> */}
      <FeaturedScholarshipSection />
      {/* <ReviewsSections /> */}
      {/* <LearnMoreSection /> */}
      {/* <BlogsSection /> */}
      <FAQSection />
      {/* <ContactUsSection /> */}
      <FooterComponent />
      {/* redundant code */}
      {/* <GoogleAnalytics gaId="G-EDLBJ03Y1C" /> */}
    </Box>
  );
};

export default Home;
