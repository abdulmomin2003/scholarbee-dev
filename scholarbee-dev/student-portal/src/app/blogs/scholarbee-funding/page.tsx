import Footer from '@/components/organisms/footer';
import Navbar from '@/components/organisms/navbar';
import {
  Box,
  Button,
  Container,
  // Grid,
  //   IconButton,
  Stack,
  Typography
} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
// import facebookIcon from '@public/assets/svg/facebook.svg';
// import instagramIcon from '@public/assets/svg/instagram.svg';
// import linkedInIcon from '@public/assets/svg/linkedin.svg';
import { COLORS } from '@/constants/colors';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { CustomTypography } from '@/components/atoms/customTypography';
// import BlogCard from '@/components/molecules/blogCard';

// const fetchBlogs = async () => {
//   const res = await fetch(
//     'http://api-dev.scholarbee.pk/api/blog-posts?page=1&limit=10&sortBy=published_at&sortOrder=desc',
//     {
//       cache: 'no-store'
//     }
//   );

//   if (!res.ok) {
//     throw new Error('Failed to fetch blogs');
//   }

//   const data = await res.json();
//   return data || [];
// };

// const fetchBlogBySlug = async (slug: string) => {
//   const res = await fetch(
//     `http://api-dev.scholarbee.pk/api/blog-posts/${slug}`,
//     {
//       cache: 'no-store'
//     }
//   );

//   if (!res.ok) {
//     throw new Error('Failed to fetch blog');
//   }

//   const data = await res.json();
//   return data || {};
// };

const BlogDetails = async () => {
  // const BlogDetails = async ({ params }: { params: { slug: string } }) => {
  // const blogs = await fetchBlogs();
  // const { slug } = params;
  // const blogDetails = await fetchBlogBySlug(slug);

  return (
    <Box>
      <Navbar />
      <Container>
        <CustomTypography smallFont={32} my={8} fontWeight={700} fontSize={46}>
          ScholarBee Secures $350,000 Pre-Seed Funding to Transform Higher
          Education Access
        </CustomTypography>
        <Image
          style={{
            flexShrink: 0,
            borderRadius: '40px',
            maxWidth: '100%',
            objectFit: 'cover'
          }}
          height={460}
          width={1200}
          alt="blog-cover-image"
          src="/assets/png/blog-cover.png"
        />
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: '600',
              lineHeight: '18px',
              backgroundColor: COLORS.primary,
              p: 1,
              borderRadius: '5px',
              color: 'white'
            }}
          >
            Dubai, UAE - March 2025
          </Typography>
          <Box
            sx={{ mt: 2, display: 'flex', gap: 3 }}
            data-test-id="footer-social-links"
          >
            <Link
              href="https://www.facebook.com/profile.php?id=61565762532814"
              passHref
              target="_blank"
              rel="noopener noreferrer"
              style={{ cursor: 'pointer', color: 'black' }}
            >
              <FacebookIcon />
            </Link>
            <Link
              href="https://www.instagram.com/scholarbee.ai/"
              passHref
              target="_blank"
              rel="noopener noreferrer"
              style={{ cursor: 'pointer', color: 'black' }}
            >
              <InstagramIcon />
            </Link>
            <Link
              href="https://www.linkedin.com/company/scholarbee/"
              passHref
              target="_blank"
              rel="noopener noreferrer"
              style={{ cursor: 'pointer', color: 'black' }}
            >
              <LinkedInIcon />
            </Link>
          </Box>
        </Stack>
        <Box
          sx={{
            backgroundColor: COLORS.bgColorBlogs,
            px: 3,
            py: 4,
            borderRadius: '16px',
            my: 4
          }}
        >
          <Typography fontSize={20}>
            ScholarBee, a rising force in the EdTech world, is on a mission to
            revolutionize the way students access scholarships and higher
            education. Today, the company proudly announces the successful close
            of its $350,000 pre-seed funding round, achieving an impressive $3.5
            million valuation. This milestone, backed by International
            investors, marks a major step toward ScholarBee’s vision of making
            quality education accessible to students worldwide.
          </Typography>
        </Box>
        <Typography fontSize={18} my={6}>
          Born from a real-life struggle, ScholarBee was founded by an
          individual who personally experienced the challenges of finding the
          right scholarships and universities. The platform is designed to
          eliminate the confusion, stress, and endless searching that students
          often face, offering a seamless, AI-powered solution that personalizes
          scholarship and university recommendations based on each student’s
          needs and aspirations.
        </Typography>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 3, md: 10 }}
          alignItems="center"
        >
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              justifyContent: 'center',
              width: '100%'
            }}
          >
            <Image
              style={{
                borderRadius: '40px'
              }}
              height={290}
              width={290}
              alt="taimoor_image"
              src="/assets/png/taimoor.png"
            />
          </Box>

          <Box>
            <Typography fontSize={{ xs: 24, sm: 32 }} fontWeight={600}>
              &quot;Education should be a right,
              <br />
              not a privilege,&quot;
            </Typography>
            <Stack direction="row" flexWrap="wrap">
              <Typography fontSize={{ xs: 16, sm: 20 }}>said &nbsp;</Typography>
              <Typography fontSize={{ xs: 16, sm: 20 }} fontWeight={600}>
                M. Taimur Ali, Founder of ScholarBee
              </Typography>
            </Stack>
            <Typography fontSize={{ xs: 16, sm: 20 }} mt={3}>
              &quot;ScholarBee was created to ensure that no student misses out
              on an opportunity just because they didn&apos;t have the right
              information. This funding brings us one step closer to reshaping
              the future of higher education, making it smarter, faster, and
              accessible to all.&quot;
            </Typography>
          </Box>

          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexShrink: 0
            }}
          >
            <Image
              style={{
                borderRadius: '40px'
              }}
              height={290}
              width={290}
              alt="taimoor_image"
              src="/assets/png/taimoor.png"
            />
          </Box>
        </Stack>

        <Typography fontSize={18} my={6}>
          ScholarBee’s innovative approach and strong vision have drawn
          confidence from investors worldwide. According to one of the
          international investors of the company states, “ScholarBee is a light
          in darkness! Filling a crucial gap in the education space where many
          youngsters struggle to find the right opportunities in the complex
          world of scholarships and university admissions, ScholarBee offers a
          powerful solution to bridge that gap. We see massive potential for
          impact and growth, and We’re excited to be part of this journey.”
        </Typography>

        <Image
          style={{
            flexShrink: 0,
            borderRadius: '16px',
            maxWidth: '100%',
            objectFit: 'cover'
          }}
          height={288}
          width={1200}
          alt="blog-cover-image"
          src="/assets/png/blog-scholarship.png"
        />

        <Typography fontSize={18} my={6}>
          With this funding, ScholarBee is set to scale its AI-driven platform,
          forge global partnerships with universities and scholarship providers,
          and expand its footprint in international markets. The company is
          focused on building a future where every student, regardless of
          financial constraints, has the guidance and resources to reach their
          academic dreams.
        </Typography>

        <Typography fontSize={18} my={6}>
          Registered in Dubai and prepared to launch in Pakistan, ScholarBee has
          already gained recognition as a leading innovator in the edtech space,
          with early support from NIC Pakistan and an Initial $100,000
          investment at the idea stage. The company’s vision is simple yet
          powerful: To create a world where every student has an equal
          opportunity to excel. With a bold vision and the backing of strategic
          investors, ScholarBee is now gearing up to enhance its platform and
          solidify its presence in both Pakistan and international markets to
          turn its academic aspirations into reality.
        </Typography>

        <Box
          sx={{
            py: 4,
            px: 3,
            backgroundColor: COLORS.bgColorBlogs,
            borderRadius: '16px',
            my: 4
          }}
        >
          <Typography>
            For media inquiries, partnerships, or more information, please
            contact:
            <br />
            ScholarBee Media Team
            {/* <br />
            Social Media Manager’s Name */}
            <br />
            +92 325 555 9699
            <br />
            info@scholarbee.pk | www.scholarbee.pk
          </Typography>
          <Button
            sx={{
              px: 7,
              mt: 4
            }}
            variant="contained"
          >
            Contact Us
          </Button>
        </Box>

        {/* <Box>
          <Typography fontWeight={600} fontSize={36}>
            Other Articles
          </Typography>
          <Grid container mt={5} mb={10} spacing={2}>
            {blogs.posts.length > 0 &&
              blogs.posts
                .slice(0, Math.min(3, blogs.posts.length))
                .map(
                  (blog: {
                    _id: string;
                    title: string;
                    published_at: string;
                  }) => (
                    <Grid
                      key={blog?._id}
                      sx={{ margin: '0 auto' }}
                      size={{ xs:12, sm:6, md:4}}
                    >
                      <BlogCard
                        title={blog?.title || ''}
                        publishedAt={blog?.published_at || ''}
                      />
                    </Grid>
                  )
                )}
          </Grid>
        </Box> */}
      </Container>
      <Footer />
    </Box>
  );
};

export default BlogDetails;
