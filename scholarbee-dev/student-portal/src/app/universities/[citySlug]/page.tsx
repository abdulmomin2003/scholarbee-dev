import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { fetchCampusesServer } from '@/app/campuses/serverData';
import CampusesClient from '@/app/campuses/CampusesClient';
import CampusesLoading from '@/app/campuses/(pageComponents)/skeleton';
import { getCityDisplayNameFromSlug } from '@/app/programs/constants';
import { QueryCampusParams } from '@/types/campus.types';
import {
  getCityListingIntroParagraphs,
  getUniversitiesCityFAQ
} from '../constants';

/**
 * City listing: /universities/[city-slug]/
 * Lists universities (campuses) in that city with city filter fixed.
 * Example: /universities/islamabad/, /universities/lahore/
 */
interface UniversitiesByCityPageProps {
  params: Promise<{ citySlug: string }>;
  searchParams?: Promise<{
    name?: string;
    area?: string;
    university_type?: string;
    partner_university?: string;
    page?: string;
  }>;
}

export async function generateMetadata({
  params
}: UniversitiesByCityPageProps): Promise<Metadata> {
  const { citySlug } = await params;
  const cityName = getCityDisplayNameFromSlug(citySlug);
  return {
    title: `Top Universities in ${cityName}`,
    alternates: {
      canonical: `https://scholarbee.pk/universities/${citySlug}`
    }
  };
}

export default async function UniversitiesByCityPage({
  params,
  searchParams
}: UniversitiesByCityPageProps) {
  const { citySlug } = await params;
  const cityName = getCityDisplayNameFromSlug(citySlug);
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const page = resolvedSearchParams.page
    ? Number.parseInt(resolvedSearchParams.page, 10)
    : 1;
  const name = resolvedSearchParams.name
    ? decodeURIComponent(resolvedSearchParams.name)
    : undefined;
  const area = resolvedSearchParams.area
    ? decodeURIComponent(resolvedSearchParams.area)
    : undefined;
  const universityType = resolvedSearchParams.university_type
    ? decodeURIComponent(resolvedSearchParams.university_type)
    : undefined;
  const partnerUniversity = resolvedSearchParams.partner_university === 'true';

  const queryParams: QueryCampusParams = {
    page,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    city: cityName
  };
  if (name?.trim()) queryParams.name = name.trim();
  if (area?.trim()) queryParams.area = area.trim();
  if (universityType?.trim()) queryParams.university_type = universityType.trim();
  if (partnerUniversity) queryParams.partner_university = true;

  const initialData = await fetchCampusesServer(queryParams);
  const initialSearchParams = {
    name: name || undefined,
    city: cityName,
    area: area || undefined,
    university_type: universityType || undefined,
    partner_university: partnerUniversity
  };

  return (
    <Suspense fallback={<CampusesLoading />}>
      <CampusesClient
        initialData={initialData}
        initialSearchParams={initialSearchParams}
        fixedCity={cityName}
        pageTitle={`Top Universities in ${cityName}`}
        introParagraphs={getCityListingIntroParagraphs(cityName)}
        faqItems={getUniversitiesCityFAQ(cityName)}
        showPartnerUniversityCheck
      />
    </Suspense>
  );
}
