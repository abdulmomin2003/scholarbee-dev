import { API_URL } from '@/constants/config';
import {
  ElasticsearchAdmissionProgramDocument,
  ElasticsearchAdmissionProgramsResponse
} from '@/types/admission-program.types';
import { fetchRecommendedProgramsServer } from '@/lib/fetchRecommendationsServer';

interface FetchProgramsResult {
  programs: ElasticsearchAdmissionProgramDocument[];
  totalDocs: number;
  hasNextPage: boolean;
}

function hasListingFilters(
  searchParams?: Record<string, string | string[] | undefined>
): boolean {
  if (!searchParams) return false;
  return Object.keys(searchParams).length > 0;
}

export async function fetchProgramsServer(
  searchParams?: Record<string, string | string[] | undefined>
): Promise<FetchProgramsResult> {
  if (!hasListingFilters(searchParams)) {
    return fetchRecommendedProgramsServer(50);
  }

  try {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', '50');

    const setParam = (key: string, apiKey?: string) => {
      const v = searchParams![key];
      if (v) params.set(apiKey || key, Array.isArray(v) ? v[0] : v);
    };
    setParam('search', 'programName');
    setParam('universityId', 'university');
    setParam('degree_level');
    setParam('major');
    setParam('city');
    setParam('courseForm');
    setParam('year');
    setParam('intake', 'session_term');
    setParam('min_fee');
    setParam('max_fee');

    const url = `${API_URL}/admission-programs/with-filters?${params.toString()}`;
    const res = await fetch(url, { next: { revalidate: 60 } });

    if (!res.ok) {
      return { programs: [], totalDocs: 0, hasNextPage: false };
    }

    const json = (await res.json()) as ElasticsearchAdmissionProgramsResponse;
    return {
      programs: json?.docs ?? [],
      totalDocs: json?.pagination?.totalDocs ?? json?.docs?.length ?? 0,
      hasNextPage: json?.pagination?.hasNextPage ?? false
    };
  } catch {
    return { programs: [], totalDocs: 0, hasNextPage: false };
  }
}
