import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { fetchScholarshipsServer } from './serverData';
import ScholarshipsListingClient from './ScholarshipsListingClient';
import ScholarshipsLoadingSkeleton from './components/scholarshipLoadingSkelton';

export const metadata: Metadata = {
  title: 'Search Scholarships | Scholarbee',
  description:
    'Discover scholarships. Filter by campus, degree, type, location and more.',
  alternates: {
    canonical: 'https://scholarbee.pk/search-scholarship'
  }
};

interface SearchScholarshipPageProps {
  readonly searchParams: Promise<
    Readonly<Record<string, string | string[] | undefined>>
  >;
}

export default async function SearchScholarshipPage({
  searchParams
}: SearchScholarshipPageProps) {
  const params = await searchParams;
  const { data: initialScholarships, meta: initialMeta } =
    await fetchScholarshipsServer(params);

  const initialData = initialMeta
    ? {
        initialScholarships,
        initialMeta: {
          total: initialMeta.total,
          page: initialMeta.page,
          totalPages: initialMeta.totalPages
        }
      }
    : null;

  return (
    <Suspense fallback={<ScholarshipsLoadingSkeleton />}>
      <ScholarshipsListingClient initialData={initialData} />
    </Suspense>
  );
}
