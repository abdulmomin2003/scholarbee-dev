export interface ElasticsearchAdmissionProgramDocument {
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
  /** URL segment for /programs/[programSlug]/[city]/[uni] */
  campus_slug?: string;
  seo_title_key?: string;
  campus_name: string;
  program_id: string;
  admission_id: string;
  degree_level: string;
  intake_period: string;
  session_term: string;
  /** Optional explicit intake year from API (else derived from admission dates). */
  session_year?: number;
  intake_year?: number;
  admission_startdate: string;
  admission_enddate: string;
  major: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  short_name?: string;
  university_abbreviation?: string;
  receiving_applications?: string | boolean;
  scoring_mode?: 'onboarding' | 'behavioral' | 'hybrid' | 'trending';
  match_reasons?: string[];
}

export interface ElasticsearchAdmissionProgramsResponse {
  docs: ElasticsearchAdmissionProgramDocument[];
  pagination: {
    totalDocs: number;
    limit: number;
    totalPages: number;
    page: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
  };
}

export interface ProgramCardData {
  id: string;
  slug?: string;
  programId?: string;
  programTitle: string;
  modeOfStudy: string;
  programTuitionFee: number;
  programAdmissionDeadline: string;
  programAdmissionStartDate?: string;
  admission_startdate?: string;
  campusId?: string;
  campusName: string;
  universityName: string;
  campusImage: string;
  universityLogoUrl: string;
  campusAddress: string;
  isFavorite: boolean;
  isProcessing?: boolean;
  payment_schedule: string;
  status?: string;
  /** For canonical URL /programs/[program-slug]/[city]/[uni] */
  programSlug?: string;
  citySlug?: string;
  uniSlug?: string;
  shortName?: string;
  universityAbbreviation?: string;
  receiving_applications?: string | boolean;
  /** Session / intake label for image badge (e.g. spring). */
  session_term?: string;
  session_year?: number;
  /** Explicit year from API when available. */
  intakeYear?: number;
  seo_title_key?: string;
  campusSlug?: string;
  admission_receiving_applications?: string | boolean;
  ml_score?: number;
  relevance_score?: number;
}
