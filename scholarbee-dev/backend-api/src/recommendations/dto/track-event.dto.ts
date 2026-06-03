import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRecommendationEventType, RecommendationResourceType } from '../types/recommendation.types';

export class TrackEventDto {
  @ApiProperty({
    enum: UserRecommendationEventType,
    description: 'Type of event being tracked (e.g. click, apply, favorite)',
  })
  @IsNotEmpty()
  @IsEnum(UserRecommendationEventType)
  event_type: UserRecommendationEventType;

  @ApiProperty({
    enum: RecommendationResourceType,
    description: 'The type of resource interacted with (e.g. admission_program, university)',
  })
  @IsNotEmpty()
  @IsEnum(RecommendationResourceType)
  resource_type: RecommendationResourceType;

  @ApiProperty({
    type: String,
    description: 'The MongoDB ObjectId of the resource',
  })
  @IsNotEmpty()
  @IsMongoId()
  resource_id: string;

  @ApiProperty({
    type: Object,
    required: false,
    description: 'Optional additional metadata for the event (e.g. source_page, position, dwell time)',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
