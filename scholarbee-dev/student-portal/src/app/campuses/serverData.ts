import { API_BASE_URL_DEV } from '@/config/config';
import { CampusListResponse, QueryCampusParams } from '@/types/campus.types';
import { fetchRecommendedCampusesServer } from '@/lib/fetchRecommendationsServer';

function hasCampusFilters(params: QueryCampusParams): boolean {
  return Boolean(
    params.name ||
      params.city ||
      params.area ||
      params.university_type ||
      params.partner_university
  );
}

export async function fetchCampusesServer(
  params: QueryCampusParams
): Promise<CampusListResponse | null> {
  const {
    page = 1,
    limit = 10,
    name,
    city,
    area,
    university_type,
    partner_university,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = params;

  if (!hasCampusFilters(params)) {
    const recommended = await fetchRecommendedCampusesServer(limit, page);
    if (recommended.campuses.length > 0 || recommended.total > 0) {
      return {
        data: recommended.campuses,
        meta: {
          total: recommended.total,
          page,
          limit,
          pages: recommended.pages
        }
      };
    }
  }

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    queryParams.append('sortBy', sortBy);
    queryParams.append('sortOrder', sortOrder);

    if (name) queryParams.append('name', name);
    if (city) queryParams.append('city', city);
    if (area) queryParams.append('area', area);
    if (university_type) {
      queryParams.append('university_type', university_type);
    }
    if (typeof partner_university === 'boolean') {
      queryParams.append('partner_university', String(partner_university));
    }

    const url = `${API_BASE_URL_DEV}/campuses?${queryParams.toString()}`;
    const response = await fetch(url, {
      headers,
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      console.error('Failed to fetch campuses:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching campuses:', error);
    return null;
  }
}
