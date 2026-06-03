import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { fetchCampusesServer } from '@/app/campuses/serverData';
import CampusesClient from '@/app/campuses/CampusesClient';
import CampusesLoading from '@/app/campuses/(pageComponents)/skeleton';
import { QueryCampusParams } from '@/types/campus.types';
import { UNIVERSITIES_MASTER_FAQ } from './constants';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://scholarbee.pk/universities'
  },
  title: 'Universities in Pakistan'
};

interface UniversitiesPageProps {
  searchParams: Promise<{
    name?: string;
    city?: string;
    area?: string;
    university_type?: string;
    partner_university?: string;
    page?: string;
  }>;
}

const Universities = async ({ searchParams }: UniversitiesPageProps) => {
  const params = await searchParams;
  const name = params.name ? decodeURIComponent(params.name) : undefined;
  const city = params.city ? decodeURIComponent(params.city) : undefined;
  const area = params.area ? decodeURIComponent(params.area) : undefined;
  const universityType = params.university_type
    ? decodeURIComponent(params.university_type)
    : undefined;
  const partnerUniversity = params.partner_university === 'true';
  const page = params.page ? Number.parseInt(params.page, 10) : 1;

  const queryParams: QueryCampusParams = {
    page,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  };
  if (name?.trim()) queryParams.name = name.trim();
  if (city?.trim()) queryParams.city = city.trim();
  if (area?.trim()) queryParams.area = area.trim();
  if (universityType?.trim())
    queryParams.university_type = universityType.trim();
  if (partnerUniversity) queryParams.partner_university = true;

  const initialData = await fetchCampusesServer(queryParams);
  const initialSearchParams = {
    name: name || undefined,
    city: city || undefined,
    area: area || undefined,
    university_type: universityType || undefined,
    partner_university: partnerUniversity
  };

  return (
    <Suspense fallback={<CampusesLoading />}>
      <CampusesClient
        initialData={initialData}
        initialSearchParams={initialSearchParams}
        pageTitle="Universities in Pakistan"
        pageSubtitle="Discover HEC-recognized universities and campuses across Pakistan. Compare programs, check fees, and connect directly with institutions to start your academic journey."
        faqItems={UNIVERSITIES_MASTER_FAQ}
        showPartnerUniversityCheck
      />
    </Suspense>
  );
};

export default Universities;
