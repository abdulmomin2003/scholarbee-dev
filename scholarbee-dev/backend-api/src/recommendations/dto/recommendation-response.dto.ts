import { ApiProperty } from '@nestjs/swagger';

export class RecommendationMetaDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

export class ProgramRecommendationItemDto {
  @ApiProperty()
  admission_program_id: string;

  @ApiProperty()
  program_name: string;

  @ApiProperty()
  university_name: string;

  @ApiProperty()
  campus_name: string;

  @ApiProperty()
  degree_level: string;

  @ApiProperty()
  field_of_study: string;

  @ApiProperty()
  tuition_fee: number;

  @ApiProperty()
  scholarbee_verified: boolean;

  @ApiProperty({ required: false, description: 'Only visible to admin users' })
  relevance_score?: number;

  @ApiProperty()
  scoring_mode: string;

  @ApiProperty({ type: [String] })
  match_reasons: string[];

  @ApiProperty()
  slug: string;

  @ApiProperty({ required: false })
  logo_url?: string;

  @ApiProperty({ required: false })
  admission_deadline?: string;
}

export class UniversityRecommendationItemDto {
  @ApiProperty()
  university_id: string;

  @ApiProperty()
  university_name: string;

  @ApiProperty()
  scholarbee_verified: boolean;

  @ApiProperty({ required: false, description: 'Only visible to admin users' })
  relevance_score?: number;

  @ApiProperty()
  scoring_mode: string;

  @ApiProperty({ type: [String] })
  match_reasons: string[];

  @ApiProperty()
  slug: string;

  @ApiProperty({ required: false })
  logo_url?: string;

  @ApiProperty({ required: false })
  city?: string;
}

export class ProgramRecommendationsResponseDto {
  @ApiProperty({ type: [ProgramRecommendationItemDto] })
  data: ProgramRecommendationItemDto[];

  @ApiProperty({ type: RecommendationMetaDto })
  meta: RecommendationMetaDto;
}

export class UniversityRecommendationsResponseDto {
  @ApiProperty({ type: [UniversityRecommendationItemDto] })
  data: UniversityRecommendationItemDto[];

  @ApiProperty({ type: RecommendationMetaDto })
  meta: RecommendationMetaDto;
}
