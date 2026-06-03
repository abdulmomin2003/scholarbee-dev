export interface ElasticsearchAdmissionProgramResponse {
  took: number;
  timed_out: boolean;
  _shards: ElasticsearchAdmissionProgramShards;
  hits: ElasticsearchAdmissionProgramHits;
}

export interface ElasticsearchAdmissionProgramShards {
  total: number;
  successful: number;
  skipped: number;
  failed: number;
}

export interface ElasticsearchAdmissionProgramHits {
  total: Total;
  max_score: number;
  hits: ElasticsearchAdmissionProgramHit[];
}

export interface Total {
  value: number;
  relation: string;
}

export interface ElasticsearchAdmissionProgramHit {
  _index: string;
  _id: string;
  _score: number;
  _source: ElasticsearchAdmissionProgramDocument;
  sort: [number, string];
}

/**
 * Elasticsearch document interface for admission programs.
 *
 * ## TEMPLATE_MIGRATION_TODO
 * The following fields are currently indexed directly from Program documents:
 * - `program_title` → should be sourced from ProgramTemplate.name
 * - `major` → should be sourced from ProgramTemplate.field_of_study
 * - `degree_level` → should be sourced from ProgramTemplate.degree_level
 *
 * Additionally, a new `field_of_study` field and `tags` array should be added
 * once the indexing webhook is updated to source these from ProgramTemplate.
 *
 * The indexing webhook caller (external service) must be updated to resolve
 * template fields before sending data to the webhook endpoint.
 */
export interface ElasticsearchAdmissionProgramDocument {
  doc_id: string;
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
  short_name?: string;
  seo_title_key?: string;
  study_mode: string;
  tuition_fee: number;
  university_id: string;
  university_name: string;
  campus_id: string;
  campus_name: string;
  program_id: string;
  admission_id: string;
  degree_level: string;
  intake_period: string;
  admission_startdate?: string;
  admission_enddate?: string;
  major: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface ElasticsearchAdmissionProgramDocumentWithIdAndFavorite
  extends ElasticsearchAdmissionProgramDocument {
  _id: string;
  isFavorite: boolean;
}
