import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { fetchUniversityProfileServer } from '@/app/university-details/[id]/serverData';
import UniversityDetailsClient from '@/app/university-details/[id]/UniversityDetailsClient';
import DetailPageSkeleton from '@/app/program-details/pageComponents/detailPageSkelton';
import { Box, Button, Container, Typography } from '@mui/material';
import Link from 'next/link';
import Navbar from '@/components/organisms/navbar';
import Footer from '@/components/organisms/footer';
import { COLORS } from '@/constants/colors';

interface UniversityByCityPageProps {
  params: Promise<{ citySlug: string; uniSlug: string }>;
}

export async function generateMetadata({
  params
}: UniversityByCityPageProps): Promise<Metadata> {
  const { citySlug, uniSlug } = await params;

  return {
    alternates: {
      canonical: `https://scholarbee.pk/universities/${citySlug}/${uniSlug}`
    }
  };
}

export default async function UniversityByCityPage({
  params
}: UniversityByCityPageProps) {
  // const { citySlug: _citySlug, uniSlug } = await params;
  const { uniSlug, citySlug } = await params;

  // Backend profile lookup is based on university slug/id only; city is purely for SEO/path.
  const universityProfile = await fetchUniversityProfileServer(
    uniSlug,
    citySlug
  );

  if (!universityProfile) {
    return (
      <Box bgcolor={COLORS.bgColor}>
        <Navbar />
        <Container sx={{ py: 14, textAlign: 'center' }}>
          <Typography variant="h4" color="error" gutterBottom>
            Campus Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            The campus you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </Typography>
          <Link href="/universities" style={{ textDecoration: 'none' }}>
            <Button variant="outlined" component="span">
              Explore Universities
            </Button>
          </Link>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Suspense fallback={<DetailPageSkeleton />}>
      <UniversityDetailsClient universityProfile={universityProfile} />
    </Suspense>
  );
}
