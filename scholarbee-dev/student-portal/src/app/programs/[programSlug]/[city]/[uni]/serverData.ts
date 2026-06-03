import { API_BASE_URL_DEV } from '@/config/config';
import { toUrlSlug } from '@/utils/helperFunctions';

function decodeURIComponentSafe(input: string): string {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}

/**
 * Fetches program details by the 3-segment path: program-slug, city, university.
 * Tries: 1) path endpoint, 2) composite slug, 3) listing API + match by program/city/uni.
 */
export async function fetchProgramDetailsByPath(
  programSlug: string,
  city: string,
  uni: string
): Promise<any | null> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };

  const opts = { headers, cache: 'no-store' as RequestCache };
  const decodedProgramSlug = decodeURIComponentSafe(String(programSlug ?? ''));
  const decodedCity = decodeURIComponentSafe(String(city ?? ''));
  const decodedUni = decodeURIComponentSafe(String(uni ?? ''));

  // 1) Try path-based endpoint (backend may support: GET /admission-programs/path/:programSlug/:city/:uni)
  const pathUrl = `${API_BASE_URL_DEV}/admission-programs/path/${encodeURIComponent(decodedProgramSlug)}/${encodeURIComponent(decodedCity)}/${encodeURIComponent(decodedUni)}`;
  try {
    const pathRes = await fetch(pathUrl, opts);
    if (pathRes.ok) {
      return await pathRes.json();
    }
  } catch {
    // ignore, try fallback
  }

  // 2) Fallback: existing slug API with composite slug (programSlug-city-uni)
  const compositeSlug = [decodedProgramSlug, decodedCity, decodedUni]
    .filter(Boolean)
    .join('-');
  if (compositeSlug) {
    try {
      const slugUrl = `${API_BASE_URL_DEV}/admission-programs/slug/${encodeURIComponent(compositeSlug)}`;
      const res = await fetch(slugUrl, opts);
      if (res.ok) return await res.json();
    } catch {
      // ignore, try listing fallback
    }
  }

  // 3) Fallback: fetch from listing API with filters, find matching program, then fetch by slug
  const programSearch = decodedProgramSlug.replaceAll('-', ' ');
  const cityName = decodedCity.replaceAll('-', ' ');
  const cityCapitalized =
    cityName.charAt(0).toUpperCase() + cityName.slice(1).toLowerCase();

  const params = new URLSearchParams();
  params.set('page', '1');
  params.set('limit', '50');
  params.set('programName', programSearch);
  params.set('city', cityCapitalized);

  try {
    const listUrl = `${API_BASE_URL_DEV}/admission-programs/with-filters?${params.toString()}`;
    const listRes = await fetch(listUrl, opts);
    if (!listRes.ok) return null;

    const listJson = await listRes.json();
    const docs = listJson?.docs ?? [];
    const uniSlugLower = decodedUni.toLowerCase();

    const match = docs.find(
      (doc: { university_name?: string; slug?: string; _id?: string }) => {
        const docUniSlug = toUrlSlug(doc?.university_name ?? '');
        return (
          docUniSlug === uniSlugLower || docUniSlug?.includes(uniSlugLower)
        );
      }
    );

    if (match?.slug) {
      const detailUrl = `${API_BASE_URL_DEV}/admission-programs/slug/${encodeURIComponent(match.slug)}`;
      const detailRes = await fetch(detailUrl, opts);
      if (detailRes.ok) return await detailRes.json();
    }
    if (match?._id) {
      const detailUrl = `${API_BASE_URL_DEV}/admission-programs/slug/${encodeURIComponent(match._id)}`;
      const detailRes = await fetch(detailUrl, opts);
      if (detailRes.ok) return await detailRes.json();
    }
  } catch (error) {
    console.error('Error fetching program details by path:', error);
  }

  return null;
}
