import { cookies } from 'next/headers';
import { API_BASE_URL_DEV } from '@/config/config';
import type { Scholarship } from '@/types/scholarship';

export interface ScholarshipsListResponse {
  data: Scholarship[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/** Build query params for scholarships API from URL searchParams (same shape as client). */
function buildScholarshipsQuery(
  searchParams?: Record<string, string | string[] | undefined>
): URLSearchParams {
  const params = new URLSearchParams();
  params.set('page', '1');
  params.set('limit', '20');

  if (!searchParams) return params;

  const setParam = (key: string) => {
    const v = searchParams[key];
    if (v) params.set(key, Array.isArray(v) ? v[0] : v);
  };

  setParam('search');
  setParam('campusId');
  setParam('campus');
  setParam('degree_level');
  setParam('scholarship_type');
  setParam('location');
  setParam('status');
  setParam('rating');
  setParam('deadline_status');

  const amountRaw = searchParams.amount;
  const amount = amountRaw
    ? Array.isArray(amountRaw)
      ? amountRaw[0]
      : amountRaw
    : '';
  if (amount) {
    const [min, max] = amount.split('-').map(Number);
    if (!Number.isNaN(min)) params.set('amountMin', String(min));
    if (!Number.isNaN(max)) params.set('amountMax', String(max));
  }

  return params;
}

export async function fetchScholarshipsServer(
  searchParams?: Record<string, string | string[] | undefined>
): Promise<ScholarshipsListResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      const h = headers as Record<string, string>;
      h['Authorization'] = `Bearer ${token}`;
    }

    const query = buildScholarshipsQuery(searchParams);
    const url = `${API_BASE_URL_DEV}/scholarships?${query.toString()}`;
    const response = await fetch(url, { headers, cache: 'no-store' });

    if (!response.ok) {
      return {
        data: [],
        meta: { total: 0, page: 1, limit: 20, totalPages: 0 }
      };
    }

    const json = (await response.json()) as {
      data?: Scholarship[];
      meta?: { total: number; page: number; limit: number; totalPages: number };
    };
    return {
      data: json?.data ?? [],
      meta: json?.meta ?? {
        total: json?.data?.length ?? 0,
        page: 1,
        limit: 20,
        totalPages: 1
      }
    };
  } catch {
    return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
  }
}
