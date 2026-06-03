import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/organisms/navbar';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://scholarbee.pk/blogs'
  }
};
import graphIcon from '@public/assets/svg/graph.svg';
import blogIllustration from '@public/assets/svg/blog-illustration.svg';
import FAQSection from '@/components/organisms/faqSection';
import FooterComponent from '@/components/organisms/footer';
import HeroSection from '../../components/organisms/heroSection';
import AllBlogs from './pageComponents/blogsSection';

const Blogs = () => {
  return (
    <>
      <Navbar />
      <HeroSection
        illustrationImage={blogIllustration}
        upperHeadingIcon={graphIcon}
        upperHeading="Explore Insights and Stories"
        heading="Stay Informed with Scholarbee’s Expert Blog"
        lowerText="Your Go-To Source for Educational Tips, Trends, and Success Stories."
      />
      <AllBlogs />
      <FAQSection />
      <FooterComponent />
    </>
  );
};

export default Blogs;
