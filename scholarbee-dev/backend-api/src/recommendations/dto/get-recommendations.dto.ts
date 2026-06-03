import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum RecommendationType {
  PROGRAMS = 'programs',
  UNIVERSITIES = 'universities',
}

export class GetRecommendationsDto {
  @ApiPropertyOptional({
    enum: RecommendationType,
    default: RecommendationType.PROGRAMS,
    description: 'Type of recommendations to fetch (programs or universities)',
  })
  @IsOptional()
  @IsEnum(RecommendationType)
  type?: RecommendationType = RecommendationType.PROGRAMS;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 100,
    default: 20,
    description: 'Maximum number of recommendations to return',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
    description: 'Page number for pagination',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    type: String,
    description: 'Context identifier (e.g., homepage, program-details) to customize scoring',
  })
  @IsOptional()
  @IsString()
  context?: string;
}
