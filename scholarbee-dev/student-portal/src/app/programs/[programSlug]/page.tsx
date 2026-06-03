import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import ProgramsContent from '../ProgramsContent';
import ProgramsLoading from '../(pageComponents)/skelton';
import { fetchProgramsServer } from '../serverData';
import { getMajorFromProgramSlug } from '../constants';

interface Level1ProgramsPageProps {
  params: Promise<{ programSlug: string }>;
  searchParams?: Record<string, string | string[] | undefined>;
}

export async function generateMetadata({
  params,
  searchParams
}: Level1ProgramsPageProps): Promise<Metadata> {
  const { programSlug } = await params;
  const major = getMajorFromProgramSlug(programSlug);
  const hasOtherFilters =
    searchParams != null &&
    Object.keys(searchParams).some((k) => k !== 'major');

  const canonical = `https://scholarbee.pk/programs/${programSlug}`;

  const base: Metadata = {
    alternates: { canonical },
    title: `${major} Programs`
  };

  if (!hasOtherFilters) {
    return base;
  }

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

export default async function Level1ProgramsPage({
  params,
  searchParams
}: Level1ProgramsPageProps) {
  const { programSlug } = await params;
  const major = getMajorFromProgramSlug(programSlug);

  const mergedParams = {
    ...searchParams,
    major
  } as Record<string, string | string[] | undefined>;

  const { programs, totalDocs } = await fetchProgramsServer(mergedParams);

  return (
    <Suspense fallback={<ProgramsLoading />}>
      <ProgramsContent
        initialPrograms={programs}
        initialTotalDocs={totalDocs}
        fixedMajor={major}
        majorName={major}
      />
    </Suspense>
  );
}
