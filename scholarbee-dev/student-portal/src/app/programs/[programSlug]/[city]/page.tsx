import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import ProgramsContent from '../../ProgramsContent';
import ProgramsLoading from '../../(pageComponents)/skelton';
import { fetchProgramsServer } from '../../serverData';
import {
  getMajorFromProgramSlug,
  getCityValueFromSlug,
  getCityDisplayNameFromSlug
} from '../../constants';

interface Level2ProgramsPageProps {
  params: Promise<{ programSlug: string; city: string }>;
  searchParams?: Record<string, string | string[] | undefined>;
}

export async function generateMetadata({
  params,
  searchParams
}: Level2ProgramsPageProps): Promise<Metadata> {
  const { programSlug, city: citySegment } = await params;
  const major = getMajorFromProgramSlug(programSlug);
  const cityName = getCityDisplayNameFromSlug(citySegment);
  const hasOtherFilters =
    searchParams != null &&
    Object.keys(searchParams).some((k) => k !== 'major' && k !== 'city');

  const canonical = `https://scholarbee.pk/programs/${programSlug}/${citySegment}`;

  const base: Metadata = {
    alternates: { canonical },
    title: `${major} Programs in ${cityName}`
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

export default async function Level2ProgramsPage({
  params,
  searchParams
}: Level2ProgramsPageProps) {
  const { programSlug, city: citySegment } = await params;
  const major = getMajorFromProgramSlug(programSlug);
  const cityValue = getCityValueFromSlug(citySegment);
  const cityName = getCityDisplayNameFromSlug(citySegment);

  const mergedParams = {
    ...searchParams,
    major,
    city: cityValue
  } as Record<string, string | string[] | undefined>;

  const { programs, totalDocs } = await fetchProgramsServer(mergedParams);

  return (
    <Suspense fallback={<ProgramsLoading />}>
      <ProgramsContent
        initialPrograms={programs}
        initialTotalDocs={totalDocs}
        fixedMajor={major}
        fixedCity={cityValue}
        majorName={major}
        cityName={cityName}
      />
    </Suspense>
  );
}
