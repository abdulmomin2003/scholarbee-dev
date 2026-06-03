import { cookies } from 'next/headers';
import { ElasticsearchAdmissionProgramDocument } from '@/types/admission-program.types';
import { Scholarship } from '@/types/scholarship';
import { fetchRecommendedProgramsServer } from '@/lib/fetchRecommendationsServer';
import { API_BASE_URL_DEV } from '@/config/config';

export interface HomeProgramsResponse {
  docs: ElasticsearchAdmissionProgramDocument[];
  pagination?: {
    totalDocs: number;
    limit: number;
    page: number;
    totalPages: number;
  };
}

export interface HomeScholarshipsResponse {
  data: Scholarship[];
  meta?: { total: number };
}

export async function fetchHomeScholarships(): Promise<HomeScholarshipsResponse | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL_DEV}/scholarships?page=1&limit=10`;
    const response = await fetch(url, { headers, cache: 'no-store' });

    if (!response.ok) return null;

    const data = await response.json();
    return data;
  } catch {
    return null;
  }
}

export async function fetchHomePrograms(): Promise<HomeProgramsResponse | null> {
  try {
    const { programs, totalDocs } = await fetchRecommendedProgramsServer(15);

    if (!programs.length && totalDocs === 0) {
      return null;
    }

    return {
      docs: programs,
      pagination: {
        totalDocs,
        limit: 15,
        page: 1,
        totalPages: Math.ceil(totalDocs / 15)
      }
    };
  } catch {
    return null;
  }
}
