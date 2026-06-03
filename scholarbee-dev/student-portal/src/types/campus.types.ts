export interface Address {
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

export interface University {
  _id: string;
  slug?: string;
  name: string;
  ranking?: string;
  accreditations?: string;
  logo_url?: string;
  [key: string]: unknown;
}

export interface Campus {
  _id: string;
  slug?: string;
  name: string;
  university_id: University | string;
  address_id?: Address | string;
  address?: Address;
  campus_type?: string;
  established_date?: string | Date;
  campus_area?: number;
  website?: string;
  contact_phone?: string;
  contact_email?: string;
  logo_url?: string;
  scholarbee_verified?: boolean;
  latitude?: number;
  longitude?: number;
  student_population?: number;
  level?: number;
  library_facilities?: boolean;
  sports_facilities?: boolean;
  dining_options?: boolean;
  transportation_options?: boolean;
  residential_facilities?: boolean;
  healthcare_facilities?: boolean;
  parking_facilities?: boolean;
  security_features?: boolean;
  facilities?: string;
  accreditations?: string;
  is_primary?: boolean;
  is_partner?: boolean;
  partner_university?: boolean;
  pictures?: { url: string }[];
  faculty_count?: number;
  createdBy?: string;
  favouriteBy?: string[];
  isFavorite?: boolean; // Added by backend for authenticated users
  createdAt?: string;
  updatedAt?: string;
}

export interface CampusListResponse {
  data: Campus[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CampusFilters {
  name?: string;
  city?: string;
  area?: string;
  university_type?: string;
  partner_university?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface QueryCampusParams {
  name?: string;
  city?: string;
  area?: string;
  university_type?: string;
  partner_university?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Partner Universities API Types
export interface PartnerCampus {
  slug: null;
  _id: string;
  name: string;
  logo_url: string | null;
  website?: string;
  city?: string;
}

export interface PartnerUniversity {
  _id: string;
  name: string;
  logo_url: string | null;
  slug?: string;
  website?: string;
  city?: string;
}

export interface PartnerUniversityGroup {
  university: PartnerUniversity;
  campuses: PartnerCampus[];
}

export interface PartnerUniversitiesResponse {
  data: PartnerUniversityGroup[];
}
