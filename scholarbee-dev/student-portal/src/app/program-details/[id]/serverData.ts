import { cache } from 'react';
import { cookies } from 'next/headers';
import { API_BASE_URL_DEV } from '@/config/config';

/** Title case: first letter of each word uppercase, rest lowercase. */
// function toTitleCase(s: string): string {
//   return s
//     .trim()
//     .toLowerCase()
//     .replace(/\b\w/g, (c) => c.toUpperCase());
// }

// function decodeURIComponentSafe(input: string): string {
//   try {
//     return decodeURIComponent(input);
//   } catch {
//     return input;
//   }
// }

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

// function parseProgramSlugAndIntake(programSlug: string): {
//   seoTitleKey: string;
//   intakePeriod?: string;
// } {
//   const normalizedSlug = String(programSlug ?? '')
//     .trim()
//     .toLowerCase();

//   // Combined listing slug format: `${seo_title_key}-${intake_period}`
//   // where intake_period is season-only in URL (e.g. `fall` or `spring`).
//   const intakeSuffixMatch = normalizedSlug.match(
//     /-(spring|summer|fall|winter)$/
//   );

//   if (!intakeSuffixMatch) {
//     return { seoTitleKey: normalizedSlug };
//   }

//   const season = intakeSuffixMatch[1];
//   const seoTitleKey = normalizedSlug.slice(0, -intakeSuffixMatch[0].length);
//   const intakePeriod = season;

//   return { seoTitleKey, intakePeriod };
// }

export async function fetchProgramDetailsServer(
  programSlug: string,
  city: string,
  uni: string,
  sessionSegment?: string,
  sessionYear?: string
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

    // Authenticated responses may include user-specific fields; cache anonymous reads briefly.
    const opts = token
      ? { headers, cache: 'no-store' as RequestCache }
      : { headers, next: { revalidate: 60 } };

    // Swagger-like request formatting:
    // degree_level=bachelors, major="Computer Science & Information Technology", city=lahore
    // const degreeStr = String(degree_level ?? '')
    //   .trim()
    //   .toLowerCase();

    // `major` may arrive as URL-encoded text (e.g. "Computer%20Science%20%26%20Information..."),
    // decode it before title-casing to ensure `&` becomes `&` (not `%26`).
    // const majorDecoded = decodeURIComponentSafe(String(major ?? ''));
    // const majorStr = toTitleCase(majorDecoded.replace(/-/g, ' '));

    const cityStr = decodeURIComponentSafe(String(city ?? '')).toLowerCase();
    const uniStr = decodeURIComponentSafe(String(uni ?? '')).trim();

    // const slugUrl = `${API_BASE_URL_DEV}/admission-programs/detail-list?university_slug=${encodeURIComponent(uniStr)}&major=${encodeURIComponent(majorStr)}&degree_level=${encodeURIComponent(degreeStr)}&city=${encodeURIComponent(cityStr)}`;
    const queryParams = new URLSearchParams({
      campus_slug: uniStr,
      seo_title_key: programSlug,
      city: cityStr,
      session_term: sessionSegment ?? '',
      session_year: sessionYear ?? ''
    });
    const slugUrl = `${API_BASE_URL_DEV}/admission-programs/detail-list?${queryParams.toString()}`;

    // console.log({ slugUrl });

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
export const fetchProgramDetailsServerCached = cache(fetchProgramDetailsServer);
