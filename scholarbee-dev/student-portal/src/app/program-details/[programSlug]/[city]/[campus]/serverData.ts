import { cache } from 'react';
import { cookies } from 'next/headers';
import { API_BASE_URL_DEV } from '@/config/config';

interface ProgramDetailIdentifier {
  slug?: string;
  _id?: string;
}

function decodeURIComponentSafe(input: string): string {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}

export async function fetchProgramDetailsListServer(
  programSlug: string,
  city: string,
  campus: string
): Promise<ProgramDetailIdentifier | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const opts = token
      ? { headers, cache: 'no-store' as RequestCache }
      : { headers, next: { revalidate: 60 } };

    const cityStr = decodeURIComponentSafe(String(city ?? '')).toLowerCase();
    const uniStr = String(campus ?? '').trim();
    const seoTitleKey = String(programSlug ?? '').trim();

    const queryParams = new URLSearchParams({
      campus_slug: uniStr,
      seo_title_key: seoTitleKey,
      city: cityStr
    });

    const slugUrl = `${API_BASE_URL_DEV}/programs/detail-list?${queryParams.toString()}`;

    const slugRes = await fetch(slugUrl, opts);

    if (slugRes.ok) {
      const data = await slugRes.json();
      // API returns an array; return first program detail object
      const first = Array.isArray(data) ? data[0] : data;
      return (first as ProgramDetailIdentifier | null) ?? null;
    }

    return null;
  } catch (error) {
    console.error('Error fetching program details:', error);
    return null;
  }
}

/** Dedupes identical fetches within a single request (page + generateMetadata). */
export const fetchProgramDetailsListServerCached = cache(
  fetchProgramDetailsListServer
);
