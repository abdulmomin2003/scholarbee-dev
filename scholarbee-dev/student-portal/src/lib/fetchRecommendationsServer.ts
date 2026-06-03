import { cookies } from 'next/headers';
import { API_BASE_URL_DEV } from '@/config/config';
import {
  RecommendationsApiResponse,
  RecommendedUniversity
} from '@/types/recommendation.types';
import { ElasticsearchAdmissionProgramDocument } from '@/types/admission-program.types';
import { mapRecommendedUniversityToCampus } from '@/utils/recommendations';
import { Campus } from '@/types/campus.types';

type RecommendationType = 'programs' | 'universities';

interface FetchRecommendationsOptions {
  type: RecommendationType;
  limit?: number;
  page?: number;
}

async function fetchRecommendationsRaw<T>(
  options: FetchRecommendationsOptions
): Promise<RecommendationsApiResponse<T> | null> {
  const { type, limit = 20, page = 1 } = options;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL_DEV}/recommendations?type=${type}&limit=${limit}&page=${page}`;
    const response = await fetch(url, { headers, cache: 'no-store' });

    if (!response.ok) return null;

    return (await response.json()) as RecommendationsApiResponse<T>;
  } catch {
    return null;
  }
}

export async function fetchRecommendedProgramsServer(
  limit = 50,
  page = 1
): Promise<{
  programs: ElasticsearchAdmissionProgramDocument[];
  totalDocs: number;
  hasNextPage: boolean;
}> {
  const response = await fetchRecommendationsRaw<ElasticsearchAdmissionProgramDocument>(
    { type: 'programs', limit, page }
  );

  if (!response) {
    return { programs: [], totalDocs: 0, hasNextPage: false };
  }

  const totalDocs = response.meta?.total ?? response.data.length;
  const totalPages = Math.ceil(totalDocs / limit);

  return {
    programs: response.data ?? [],
    totalDocs,
    hasNextPage: page < totalPages
  };
}

export async function fetchRecommendedCampusesServer(
  limit = 10,
  page = 1
): Promise<{
  campuses: Campus[];
  total: number;
  pages: number;
}> {
  const response = await fetchRecommendationsRaw<RecommendedUniversity>({
    type: 'universities',
    limit,
    page
  });

  if (!response) {
    return { campuses: [], total: 0, pages: 0 };
  }

  const total = response.meta?.total ?? response.data.length;
  const pages = Math.ceil(total / limit) || 1;

  return {
    campuses: (response.data ?? []).map(mapRecommendedUniversityToCampus),
    total,
    pages
  };
}
