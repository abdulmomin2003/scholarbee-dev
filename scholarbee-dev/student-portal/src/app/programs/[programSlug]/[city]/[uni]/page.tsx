import type { Metadata } from 'next';
import { fetchProgramDetailsServerCached } from '@/app/program-details/[id]/serverData';
import ProgramDetailsView from '@/app/program-details/ProgramDetailsView';
import ProgramDetailsNotFound from '@/app/program-details/ProgramDetailsNotFound';
import {
  buildAdmissionProgramDetailMetadata,
  parseSessionSearchParam
} from '@/app/program-details/programDetailMetadata';

interface ProgramDetailPageProps {
  params: Promise<{ programSlug: string; city: string; uni: string }>;
  searchParams: Promise<{ session?: string }>;
}

export async function generateMetadata({
  params,
  searchParams
}: ProgramDetailPageProps): Promise<Metadata> {
  const { programSlug, city, uni } = await params;
  const { session } = await searchParams;
  const { sessionSegment, sessionYear } = parseSessionSearchParam(session);
  const canonical = `https://scholarbee.pk/programs/${programSlug}/${city}/${uni}`;

  const details = await fetchProgramDetailsServerCached(
    programSlug,
    city,
    uni,
    sessionSegment,
    sessionYear
  );

  return buildAdmissionProgramDetailMetadata(details, canonical);
}

export default async function ProgramDetailByPathPage({
  params,
  searchParams
}: ProgramDetailPageProps) {
  const { programSlug, city, uni } = await params;
  const { session } = await searchParams;
  const { sessionSegment, sessionYear } = parseSessionSearchParam(session);

  const programDetails = await fetchProgramDetailsServerCached(
    programSlug,
    city,
    uni,
    sessionSegment,
    sessionYear
  );

  if (!programDetails) {
    return <ProgramDetailsNotFound />;
  }

  return <ProgramDetailsView programDetails={programDetails} />;
}
