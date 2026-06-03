import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/organisms/navbar';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://scholarbee.pk/about-us'
  }
};
// import LearnMoreSection from '@/components/organisms/learnMoreSection';
import ReviewsSections from '@/components/organisms/reviewsSections';
import FAQSection from '@/components/organisms/faqSection';
import FooterComponent from '@/components/organisms/footer';
import OurMissionSection from './pageComponents/ourMissionSection';
import HeroSection from './pageComponents/heroSection';
import StatsSection from '@/components/organisms/statsSection';
import OurStorySection from './pageComponents/outStorySection';
import SustainGrowthSection from './pageComponents/sustainGrowthSection';
import WhyChooseUsSection from './pageComponents/whyChooseUsSection';

const AboutUs = () => {
  return (
    <>
      <Navbar isCritical={false} />
      <HeroSection />
      <StatsSection dotted />
      <OurMissionSection />
      <OurStorySection />
      {/* <LearnMoreSection /> */}
      <WhyChooseUsSection />
      <SustainGrowthSection />
      <ReviewsSections />
      <FAQSection />
      <FooterComponent />
    </>
  );
};

export default AboutUs;
