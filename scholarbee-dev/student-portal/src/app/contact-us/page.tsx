import Navbar from '@/components/organisms/navbar';
import type { Metadata } from 'next';
import PartnersSection from '@/components/organisms/partnersSection';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://scholarbee.pk/contact-us'
  }
};
// import LearnMoreSection from '@/components/organisms/learnMoreSection';
import FAQSection from '@/components/organisms/faqSection';
import ContactUsSection from '@/components/organisms/contactUsSection';
import FooterComponent from '@/components/organisms/footer';
import ReachUsSection from './pageComponents/reactUsSection';
import HeroSection from './pageComponents/heroSection';

const ContactUs = () => {
  return (
    <>
      <Navbar isCritical={false} />
      <HeroSection noGetStartedButton />
      <ReachUsSection />
      {/* <LearnMoreSection /> */}
      <FAQSection />
      <PartnersSection />
      <ContactUsSection />
      <FooterComponent />
    </>
  );
};

export default ContactUs;
