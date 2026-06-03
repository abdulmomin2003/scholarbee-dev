import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL_DEV } from '@/config/config';
// import { baseQueryWithReauth } from './baseQuery';

interface University {
  _id: string;
  name: string;
}

interface UniversitiesResponse {
  data: University[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface UniversityData {
  metadata: {
    city: string;
    state: string;
    country: string;
    established_date: string; // ISO Date string
    accreditation: string | null;
    ranking: string | null;
    total_campuses: number;
    university_logo: string;
  };

  overview: {
    description: string;
  };

  selectedCampus: Campus;

  otherCampuses: Campus[];
}

interface Campus {
  id: string;
  name: string;
  faculty: string | null;
  area: number | null;
  housing_available: boolean;
  website: string;
  address: Address;
  pictures?: string[];
  primary_picture: string;
}

interface Address {
  _id: string;
  address_line_1: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  created_at?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  __v?: number;
}

export const universitiesApi = createApi({
  reducerPath: 'universitiesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL_DEV
  }),
  // baseQuery: fetchBaseQuery({ baseUrl: 'https://api-dev.scholarbee.pk/api/' }),
  endpoints: (builder) => ({
    getUniversities: builder.query<
      UniversitiesResponse,
      { search?: string; page?: number; limit?: number; url?: string }
    >({
      query: ({ search = '', page = 1, limit = 20, url }) =>
        search === ''
          ? `${url || 'universities/open-programs'}?limit=${limit}&page=${page}`
          : `${url || 'universities/open-programs'}?limit=${limit}&page=${page}&search=${search}`
      // : `${url || 'universities/open-programs'}?limit=${limit}&page=${page}&name=${search}`
    }),
    getUniversityProfile: builder.query<
      UniversityData,
      { universityId: string; selectedCampusId?: string }
    >({
      query: ({ universityId, selectedCampusId }) => {
        const params = new URLSearchParams();
        if (selectedCampusId) {
          params.append('selectedCampusId', selectedCampusId);
        }
        const queryString = params.toString();
        return `universities/${universityId}/profile${queryString ? `?${queryString}` : ''}`;
      }
    })
  })
});

export const { useGetUniversitiesQuery, useGetUniversityProfileQuery } =
  universitiesApi;
