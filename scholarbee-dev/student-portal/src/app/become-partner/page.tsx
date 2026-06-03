import React from 'react';
import type { Metadata } from 'next';
import Navbar from '../../components/organisms/navbar';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://scholarbee.pk/become-partner'
  }
};
import HeroSection from '../../components/organisms/heroSection';
import heartCircleIcon from '@public/assets/svg/heart-circle.svg';
import blogIllustration from '@public/assets/svg/become-partner.svg';
import FooterComponent from '@/components/organisms/footer';
import BecomePartnerForm from './pageComponents/becomePartnerForm';

const BecomePartner = () => {
  return (
    <>
      <Navbar />
      <HeroSection
        illustrationSize={550}
        illustrationImage={blogIllustration}
        upperHeadingIcon={heartCircleIcon}
        upperHeading="Become Our Partner"
        heading="Partner with Us to Empower Students Worldwide"
        lowerText="Collaborate with ScholarBee to Provide Unmatched Opportunities and Support for Aspiring Scholars."
      />
      <BecomePartnerForm />
      <FooterComponent />
    </>
  );
};

export default BecomePartner;
