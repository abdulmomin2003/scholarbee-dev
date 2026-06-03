import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { fetchCampusesServer } from './serverData';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://scholarbee.pk/campuses'
  }
};
import CampusesClient from './CampusesClient';
import CampusesLoading from './(pageComponents)/skeleton';
import { QueryCampusParams } from '@/types/campus.types';

interface CampusesPageProps {
  searchParams: Promise<{
    name?: string;
    city?: string;
    area?: string;
    university_type?: string;
    page?: string;
  }>;
}

const Campuses = async ({ searchParams }: CampusesPageProps) => {
  const params = await searchParams;

  // Extract and decode search params
  const name = params.name ? decodeURIComponent(params.name) : undefined;
  const city = params.city ? decodeURIComponent(params.city) : undefined;
  const area = params.area ? decodeURIComponent(params.area) : undefined;
  const university_type = params.university_type
    ? decodeURIComponent(params.university_type)
    : undefined;
  const page = params.page ? parseInt(params.page, 10) : 1;

  // Build query params for server fetch
  const queryParams: QueryCampusParams = {
    page,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  };

  if (name && name.trim()) {
    queryParams.name = name.trim();
  }
  if (city && city.trim()) {
    queryParams.city = city.trim();
  }
  if (area && area.trim()) {
    queryParams.area = area.trim();
  }
  if (university_type && university_type.trim()) {
    queryParams.university_type = university_type.trim();
  }

  // Fetch initial data on the server
  const initialData = await fetchCampusesServer(queryParams);

  // Prepare initial search params for client
  const initialSearchParams = {
    name: name || undefined,
    city: city || undefined,
    area: area || undefined,
    university_type: university_type || undefined
  };

  return (
    <Suspense fallback={<CampusesLoading />}>
      <CampusesClient
        initialData={initialData}
        initialSearchParams={initialSearchParams}
      />
    </Suspense>
  );
};

export default Campuses;
