'use client';
import BreadCrumbs from '@/components/organisms/breadCrumbs';
import Footer from '@/components/organisms/footer';
import Navbar from '@/components/organisms/navbar';
import React, { useEffect, useState } from 'react';
import HeroSection from '../pageComponents/heroSection';
import { Container, Stack } from '@mui/material';
import Overview from '../pageComponents/overview';
import CampusInformation from '../pageComponents/campusInformation';
import OtherCampuses from '../pageComponents/otherCampuses';
import NearbyPlaces from '../pageComponents/nearbyPlaces';

interface UniversityDetailsClientProps {
  universityProfile: any;
  campusId?: string | null;
}

const UniversityDetailsClient: React.FC<UniversityDetailsClientProps> = ({
  universityProfile,
  campusId
}) => {
  const [universitiesListLink, setUniversitiesListLink] =
    useState('/universities');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('programNavigationSource', 'universities');
      const storedListingUrl = sessionStorage.getItem('universitiesListingUrl');
      if (storedListingUrl) {
        setUniversitiesListLink(storedListingUrl);
      }
    }
  }, []);
  // const params = useParams();
  const campusesCount = universityProfile?.otherCampuses?.length;
  const { overview, metadata, selectedCampus, otherCampuses } =
    universityProfile || {};

  // `campusId` used to come from URL query params; with the new universities
  // route we may not have it in the URL. Fall back to the selected campus
  // that comes back from the API response.
  const resolvedCampusId: string | null =
    campusId ??
    (selectedCampus?.id as string | undefined) ??
    (selectedCampus?._id as string | undefined) ??
    (selectedCampus?.campus_id as string | undefined) ??
    null;

  const { address, primary_picture } = selectedCampus || {};
  const { latitude, longitude } = address || {};

  const campusData = {
    city: metadata?.city || '_',
    country: metadata?.country || '_',
    establishedIn: metadata?.established_date || '_',
    accreditation: metadata?.accreditation || '_',
    ranking: metadata?.ranking || '_',
    universityName: selectedCampus?.name || '_',
    campusesCount,
    universityLogo: metadata?.university_logo || '',
    primaryPicture: primary_picture || ''
  };

  const campusInformation = {
    faculty: selectedCampus?.faculty || '_',
    area: selectedCampus?.area || '_',
    housingAvailable: selectedCampus?.housing_available ? 'Yes' : 'No',
    website: selectedCampus?.website || '_',
    city: metadata?.city || '_',
    country: metadata?.country || '_',
    primaryPicture: primary_picture || ''
  };

  return (
    <>
      <Navbar />
      <BreadCrumbs
        items={[
          {
            title: 'Universities',
            link: universitiesListLink
          },
          {
            title: selectedCampus?.name || ''
          }
        ]}
        container
        sx={{ my: 2 }}
      />
      <HeroSection campusData={campusData} />
      <Container
        sx={{
          py: 4,
          px: { xs: 2, sm: 3 },
          maxWidth: '100%',
          width: '100%'
        }}
      >
        <Stack spacing={4}>
          <Overview description={overview?.description || ''} />
          <CampusInformation
            key={resolvedCampusId || 'default'}
            campusInformation={campusInformation}
            campusId={resolvedCampusId || ''}
            currentCampus={true}
          />
          {latitude && longitude && (
            <NearbyPlaces location={{ latitude, longitude }} />
          )}
          <OtherCampuses otherCampuses={otherCampuses || []} />
        </Stack>
      </Container>
      <Footer />
    </>
  );
};

export default UniversityDetailsClient;
