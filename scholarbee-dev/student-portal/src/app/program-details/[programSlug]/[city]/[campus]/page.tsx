import type { Metadata } from 'next';
import { fetchProgramDetailsListServerCached } from './serverData';
import ProgramDetailsListView from '@/app/program-details/ProgramDetailsListView';
import ProgramDetailsNotFound from '@/app/program-details/ProgramDetailsNotFound';
import { buildProgramListDetailMetadata } from '@/app/program-details/programDetailMetadata';

interface ProgramDetailPageProps {
  params: Promise<{ programSlug: string; city: string; campus: string }>;
}

export async function generateMetadata({
  params
}: ProgramDetailPageProps): Promise<Metadata> {
  const { programSlug, city, campus } = await params;
  const canonical = `https://scholarbee.pk/program-details/${programSlug}/${city}/${campus}`;

  const details = await fetchProgramDetailsListServerCached(
    programSlug,
    city,
    campus
  );

  return buildProgramListDetailMetadata(details, canonical, city);
}

export default async function ProgramDetailBySeoPathPage({
  params
}: ProgramDetailPageProps) {
  const { programSlug, city, campus } = await params;

  const programDetails = await fetchProgramDetailsListServerCached(
    programSlug,
    city,
    campus
  );

  if (!programDetails) {
    return <ProgramDetailsNotFound />;
  }

  return <ProgramDetailsListView programDetails={programDetails} />;
}
