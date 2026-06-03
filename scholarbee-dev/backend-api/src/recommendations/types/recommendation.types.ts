export enum UserRecommendationEventType {
  CLICK = 'click',
  VIEW = 'view',
  DWELL_TIME = 'dwell_time',
  SEARCH = 'search',
  APPLY = 'apply',
  FAVORITE = 'favorite',
}

export enum RecommendationResourceType {
  ADMISSION_PROGRAM = 'admission_program',
  UNIVERSITY = 'university',
  CAMPUS = 'campus',
}

export interface ITrackEventPayload {
  event_type: UserRecommendationEventType;
  resource_type: RecommendationResourceType;
  resource_id: string;
  metadata?: Record<string, any>;
}

export interface IRecommendedProgramResponse {
  _id: string;
  slug?: string;
  campus_image: string;
  location_details: {
    complete_address: string;
    city: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  university_logo: string;
  program_title: string;
  study_mode: string;
  first_semester_fee: number;
  payment_schedule: string;
  university_id: string;
  university_name: string;
  university_slug: string;
  campus_id: string;
  campus_slug?: string;
  seo_title_key?: string;
  campus_name: string;
  program_id: string;
  admission_id: string;
  degree_level: string;
  intake_period: string;
  session_term: string;
  session_year?: number;
  intake_year?: number;
  admission_startdate: string;
  admission_enddate: string;
  major: string;
  currency: string;
  isFavorite: boolean;
  receiving_applications?: string | boolean;

  // Recommendation-specific metadata
  relevance_score?: number; // Only returned if user is admin
  scoring_mode: 'onboarding' | 'behavioral' | 'hybrid' | 'trending';
  match_reasons: string[];
  // ML Feature Snapshot
  features?: ProgramFeatures;
}

export interface ProgramFeatures {
  degree_match: number;
  field_similarity: number;
  city_match: number;
  fee_match: number;
  is_partner: boolean;
  has_active_deadline: boolean;
  program_popularity: number;
  student_city_weight: number;
  student_field_weight: number;
  student_degree_weight: number;
  student_fee_weight: number;
  prior_clicks_on_field: number;
  prior_clicks_on_city: number;
  position_in_list: number;
}

export interface IRecommendedUniversityResponse {
  university_id: string;
  university_name: string;
  scholarbee_verified: boolean;
  relevance_score?: number; // Only returned if user is admin
  scoring_mode: 'onboarding' | 'behavioral' | 'hybrid' | 'trending';
  match_reasons: string[];
  slug: string;
  logo_url?: string;
  city?: string;
  state?: string;
  country?: string;
  ranking?: string;
  established_date?: string;
  campus_area?: number;
  residential_facilities?: boolean;
}
