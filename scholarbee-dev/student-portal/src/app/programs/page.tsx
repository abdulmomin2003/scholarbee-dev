import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import ProgramsContent from './ProgramsContent';
import ProgramsLoading from './(pageComponents)/skelton';
import { fetchProgramsServer } from './serverData';

interface ProgramsPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export async function generateMetadata({
  searchParams
}: ProgramsPageProps): Promise<Metadata> {
  const hasFilters =
    searchParams != null && Object.keys(searchParams).length > 0;

  const base: Metadata = {
    alternates: {
      canonical: 'https://scholarbee.pk/programs'
    }
  };

  if (!hasFilters) {
    // Master listing page: indexable
    return base;
  }

  // Filtered views: NOINDEX with canonical pointing to /programs
  return {
    ...base,
    robots: {
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    }
  };
}

const Programs = async ({ searchParams }: ProgramsPageProps) => {
  const { programs, totalDocs } = await fetchProgramsServer(searchParams);

  return (
    <Suspense fallback={<ProgramsLoading />}>
      <ProgramsContent
        initialPrograms={programs}
        initialTotalDocs={totalDocs}
      />
    </Suspense>
  );
};

export default Programs;
