export type RecommendationScoringMode =
  | 'onboarding'
  | 'behavioral'
  | 'hybrid'
  | 'trending';

export interface RecommendedUniversity {
  university_id: string;
  university_name: string;
  scholarbee_verified: boolean;
  relevance_score?: number;
  scoring_mode: RecommendationScoringMode;
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

export interface RecommendationsApiResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}
