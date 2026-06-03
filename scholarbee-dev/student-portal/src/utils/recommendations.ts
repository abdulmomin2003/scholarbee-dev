import { Campus } from '@/types/campus.types';
import {
  RecommendationScoringMode,
  RecommendedUniversity
} from '@/types/recommendation.types';

const PERSONALIZED_SCORING_MODES: RecommendationScoringMode[] = [
  'onboarding',
  'hybrid',
  'behavioral'
];

export function isPersonalizedScoringMode(
  mode?: string
): mode is RecommendationScoringMode {
  return PERSONALIZED_SCORING_MODES.includes(mode as RecommendationScoringMode);
}

export function isRecommendationsPersonalized(
  item?: { scoring_mode?: string } | null
): boolean {
  return isPersonalizedScoringMode(item?.scoring_mode);
}

export function mapRecommendedUniversityToCampus(
  rec: RecommendedUniversity
): Campus & {
  scoring_mode?: RecommendationScoringMode;
  match_reasons?: string[];
} {
  const city = rec.city || '';
  const state = rec.state || '';
  const country = rec.country || 'Pakistan';

  return {
    _id: rec.university_id,
    name: rec.university_name,
    slug: rec.slug,
    logo_url: rec.logo_url,
    scholarbee_verified: rec.scholarbee_verified,
    established_date: rec.established_date,
    campus_area: rec.campus_area,
    residential_facilities: rec.residential_facilities,
    university_id: {
      _id: rec.university_id,
      name: rec.university_name,
      slug: rec.slug,
      logo_url: rec.logo_url,
      ranking: rec.ranking
    },
    address_id: {
      _id: rec.university_id,
      address_line_1: '',
      city,
      state,
      country,
      postal_code: '',
      latitude: 0,
      longitude: 0
    },
    scoring_mode: rec.scoring_mode,
    match_reasons: rec.match_reasons
  };
}
